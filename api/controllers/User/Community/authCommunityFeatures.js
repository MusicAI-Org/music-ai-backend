const axios = require("axios");
const mongoose = require("mongoose");
const MusicCommunityModel = require("../../../models/Community/Community.model");
const AuthenticatedUserModel = require("../../../models/User/Auth/AuthenticatedUser.model");
const cloudinary = require("../../../config/cloudinaryConfig");

// and the user id
// @params: id
// @return: user data
require("dotenv").config();

// ========================================== create communities ==========================================

const createCommunity = async (req, res) => {
  try {
    const { name, description, user, url } = req.body;

    // Validate input
    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    }

    // Check if imgUrl exists
    let imageUrl;
    imageUrl = url;

    // Create new community
    const newCommunity = new MusicCommunityModel({
      _id: new mongoose.Types.ObjectId(), // Add ID
      name,
      description,
      members: [user._id], // Add current user as a member
      createdBy: user._id, // Add current user as the creator
      chat: [], // Set chat to empty array
      imgUrl: imageUrl,
    });

    // Save new community to database
    await newCommunity.save();

    // Add the created community to the AuthenticatedUserModel's communities array
    await AuthenticatedUserModel.findByIdAndUpdate(
      user._id,
      { $push: { communities: newCommunity._id } },
      { new: true }
    );

    // Send response with created community data
    res
      .status(201)
      .json({ message: "Community created", community: newCommunity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========================================== fetch all data of the communities ==========================================
const fetchAllCommunityDataExceptJoined = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await AuthenticatedUserModel.findById(id).populate('communities');
    const userCommunityIds = user.communities.map((community) => community._id);

    const communities = await MusicCommunityModel.find({
      _id: { $nin: userCommunityIds },
    }).populate('name description createdBy members');

    return res.status(200).json({ communities });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch community data.' });
  }
};


// ========================================== join a particular community ==========================================
const joinCommunity = async (req, res) => {
  try {
    const { communityId, user } = req.body; // community ID to join
    const userId = user._id; // authenticated user ID

    // Check if the community ID is valid
    const community = await MusicCommunityModel.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the user is already a member of the community
    if (community.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already a member of the community" });
    }

    // Add the user to the community
    community.members.push(userId);
    await community.save();

    // Add the community to the user's list of joined communities
    const authuser = await AuthenticatedUserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { communities: communityId } },
      { new: true }
    );

    return res.json({ message: "Joined the community successfully", authuser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ========================================== leave a particular community ==========================================
const leaveCommunity = async (req, res) => {
  try {
    const { communityId, user } = req.body;

    const community = await MusicCommunityModel.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const memberIndex = community.members.findIndex(
      (member) => member.toString() === user._id
    );
    if (memberIndex === -1) {
      return res
        .status(400)
        .json({ message: "User is not a member of this community" });
    }

    community.members.splice(memberIndex, 1);
    await community.save();

    const userToUpdate = await AuthenticatedUserModel.findById(user._id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const communityIndex = userToUpdate.communities.findIndex(
      (c) => c.toString() === communityId
    );
    if (communityIndex === -1) {
      return res
        .status(400)
        .json({ message: "User is not a member of this community" });
    }

    userToUpdate.communities.splice(communityIndex, 1);
    await userToUpdate.save();

    return res.status(200).json({ message: "Successfully left the community" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ========================================== delete a particular community ==========================================
const deleteCommunity = async (req, res) => {
  try {
    console.log(req.body);
    const { communityId, user, user_to_transfer_ownership_id } = req.body;
    const authenticatedUserId = user._id;
    const userToTransferOwnershipToId = user_to_transfer_ownership_id;

    // Check if the user is the createdBy of the community
    const community = await MusicCommunityModel.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (authenticatedUserId.toString() !== community.createdBy.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can delete the community" });
    }

    // no members in the community and ownership is empty string
    if (userToTransferOwnershipToId == "" && community.members.length == 1) {
      // Delete the community directly if there are no members
      await MusicCommunityModel.findByIdAndDelete({ _id: communityId });
      return res
        .status(200)
        .json({ message: "Community deleted successfully" });
    }

    // Transfer ownership to another user if specified
    if (userToTransferOwnershipToId && community.members.length > 0) {
      const userToTransferOwnershipTo = await AuthenticatedUserModel.findById(
        userToTransferOwnershipToId
      );
      if (!userToTransferOwnershipTo) {
        return res.status(404).json({ message: "User not found" });
      }
      community.createdBy = userToTransferOwnershipToId;
      community.members = community.members.filter(
        (member) => member.toString() !== authenticatedUserId.toString()
      );
      await community.save();
      return res.status(200).json({
        message: `Transferred Ownership to ${userToTransferOwnershipToId}`,
      });
    }

    // cannot delete community
    return res.status(400).json({ message: "Cannot delete community" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========================================== fetch community data by ID ==========================================
const fetchCommunityDataByID = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await MusicCommunityModel.findById(id)
      .populate("members", "-password")
      .populate("createdBy", "-password");
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    return res.status(200).json(community);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ========================================== fetch all the communities of a particular user ==========================================
const fetchAllCommunitiesOfUser = async (req, res) => {
  try {
    console.log("hellooooooooooo");
    const { id } = req.params;
    console.log(id);
    const user = await AuthenticatedUserModel.findById({ _id: id });
    const communities = await MusicCommunityModel.find({
      _id: { $in: user.communities },
    }).populate("name description createdBy members");
    return res.status(200).json({ communities });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch community data." });
  }
};

module.exports = {
  createCommunity,
  fetchAllCommunityDataExceptJoined,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
  fetchCommunityDataByID,
  fetchAllCommunitiesOfUser,
};
