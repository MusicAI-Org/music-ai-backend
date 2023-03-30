const mongoose = require("mongoose");
const MusicCommunityModel = require("../../../models/Community/Community.model");
const AuthenticatedUserModel = require("../../../models/User/Auth/AuthenticatedUser.model");

// and the user id
// @params: id
// @return: user data
require("dotenv").config();

// ========================================== create communities ==========================================
const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    }

    // Create new community
    const newCommunity = new MusicCommunityModel({
      name,
      description,
      members: [req.user._id], // Add current user as a member
    });

    // Save new community to database
    await newCommunity.save();

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
const fetchAllCommunityData = async (req, res) => {
  try {
    const communities = await MusicCommunityModel.find().populate("members");
    return res.status(200).json({ communities });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch community data." });
  }
};

// ========================================== join a particular community ==========================================
const joinCommunity = async (req, res) => {
  try {
    const userId = req.user._id; // authenticated user ID
    const { communityId } = req.body; // community ID to join

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
    const user = await AuthenticatedUserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { communities: communityId } },
      { new: true }
    );

    return res.json({ message: "Joined the community successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ========================================== leave a particular community ==========================================
const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.user;

    const community = await MusicCommunityModel.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const memberIndex = community.members.findIndex(
      (member) => member.toString() === userId
    );
    if (memberIndex === -1) {
      return res
        .status(400)
        .json({ message: "User is not a member of this community" });
    }

    community.members.splice(memberIndex, 1);
    await community.save();

    return res.status(200).json({ message: "Successfully left the community" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ========================================== delete a particular community ==========================================
const deleteCommunity = async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const authenticatedUserId = req.user.id;
    const userToTransferOwnershipToId =
      req.body.user_to_transfer_ownership_to_id;

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

    // Transfer ownership to another user if specified
    if (userToTransferOwnershipToId) {
      const userToTransferOwnershipTo = await AuthenticatedUserModel.findById(
        userToTransferOwnershipToId
      );
      if (!userToTransferOwnershipTo) {
        return res.status(404).json({ message: "User not found" });
      }
      community.owner = userToTransferOwnershipToId;
      await community.save();
    }

    // Delete the community
    await MusicCommunityModel.findByIdAndDelete(communityId);

    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========================================== fetch community data by ID ==========================================
const fetchCommunityDataByID = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await MusicCommunityModel.findById(communityId)
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

module.exports = {
  createCommunity,
  fetchAllCommunityData,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
  fetchCommunityDataByID,
};
