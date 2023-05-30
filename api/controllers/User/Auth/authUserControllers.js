// controller for sending the auth user data using AuthModel
// and the user id
// @params: id
// @return: user data
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require('bcrypt');
const AuthenticatedUserModel = require("../../../models/User/Auth/AuthenticatedUser.model.js");

// ===================== create controller ===================== //
// open end-points
// for creating the new user in ecosystem
const initializeModel = async (req, res) => {
  const {
    email,
    name,
    role,
    password,
    dateOfBirth,
    avatarName,
    genre,
    avatarImg,
    phoneNumber,
    address,
    location,
  } = req.body;

  try {
    // check if the user is already present in the database
    const existingUser = await AuthenticatedUserModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const user = new AuthenticatedUserModel({
      _id: mongoose.Types.ObjectId(),
      name,
      role,
      yearOfJoining: new Date().getFullYear(),
      dateOfBirth,
      avatarName,
      email,
      password,
      genre,
      avatarImg,
      phoneNumber,
      creditsForGraph: [],
      creditsForGraphUpdatedAt: Date.now(),
      music: [],
      likedMusic: [],
      statsData: [],
      followers: [],
      following: [],
      friends: [],
      friendRequests: [],
      address,
      location,
    });

    // delete password from the user
    delete user.password;
    await user.save(); // stored user in database
    res.json({ success: true, user });
  } catch (err) {
    console.log(err.stack);
  }
};

const fetchUser = async (req, res) => {
  const { email } = req.body;
  try {
    // populate the id with the required data and then send back to the user
    const fullUserPopulatedDetails = await AuthenticatedUserModel.findOne(
      {
        email: email,
      },
      {
        _id: 1,
        name: 1,
        avatarName: 1,
        avatarImg: 1,
        role: 1,
        dateOfBirth: 1,
        yearOfJoining: 1,
        genre: 1,
        phoneNumber: 1,
        location: 1,
        likes: 1,
        music: 1,
        statsData: 1,
        comments: 1,
        followers: 1,
        following: 1,
        friends: 1,
        friendRequests: 1,
      }
    )
      .populate("music", {
        _id: 1,
        songname: 1,
        artist: 1,
        albumname: 1,
        genre: 1,
        format: 1,
        fileSize: 1,
        likes: 1,
        likesCount: 1,
        dislikes: 1,
        dislikesCount: 1,
        comments: 1,
        views: 1,
      })
      .populate("followers", {
        _id: 1,
        name: 1,
        avatarName: 1,
        avatarImg: 1,
        role: 1,
        dateOfBirth: 1,
        yearOfJoining: 1,
        genre: 1,
        phoneNumber: 1,
        location: 1,
      })
      .populate("following", {
        _id: 1,
        name: 1,
        avatarName: 1,
        avatarImg: 1,
        role: 1,
        dateOfBirth: 1,
        yearOfJoining: 1,
        genre: 1,
        phoneNumber: 1,
        location: 1,
      })
      .exec();

      // console.log(fullUserPopulatedDetails)

    if (!fullUserPopulatedDetails) {
      res.json({ success: false, err: "No user found" });
    }
    res.json({ success: true, fullUserPopulatedDetails });
  } catch (err) {
    console.log(err.stack);
    res.json({ success: false, err: "No user found" });
  }
};

const editModel = async (req, res) => {
  // Edit the user model, including changing the password
  const {
    _id,
    name,
    dateOfBirth,
    avatarName,
    genre,
    avatarImg,
    phoneNumber,
    address,
    password,
  } = req.body;

  try {
    // Code to edit the model
    const user = await AuthenticatedUserModel.findById(_id);

    if (!user) {
      return res.status(404).json({ success: false, error: "No user found" });
    }

    // Update the user's details
    user.name = name;
    user.dateOfBirth = dateOfBirth;
    user.avatarName = avatarName;
    user.genre = genre;
    user.avatarImg = avatarImg;
    user.phoneNumber = phoneNumber;
    user.address = address;

    // Change the password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, error: messages });
    }
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const deleteModel = async (req, res) => {
  const { _id, email } = req.body;

  try {
    const deletedUser = await AuthenticatedUserModel.findOneAndDelete({
      _id: _id,
      email: email,
    });

    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: deletedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ===================== social controllers =====================

// fetching the users that are followers of the users and also the users to which the user follow
const getFriendsData = async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  try {
    // find the users that are friends of the users and use lean() to convert to plain JS object
    const friends = await AuthenticatedUserModel.find(
      { _id: { $ne: id }, friends: { $eq: id } },
      {
        _id: 1,
        name: 1,
        avatarName: 1,
        avatarImg: 1,
        role: 1,
        dateOfBirth: 1,
        yearOfJoining: 1,
        address: 1,
        music: 1,
        statsData: 1,
        location: 1,
      }
    ).lean();

    if (!friends) {
      return res.json({ success: false, message: "No user found" });
    }

    return res.json({ success: true, friends });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

// follower and following
const followUser = async (req, res) => {
  const { _id, follow_id } = req.body;
  // fetching the user
  const authenticatedUser = await AuthenticatedUserModel.findById(_id); // this user want to follow
  // fetching the user to be followed
  const userToFollow = await AuthenticatedUserModel.findById(follow_id); // authenticated user wants to follow this user

  try {
    if (!authenticatedUser) {
      res.json({ success: false, message: "No user found" });
    }
    if (!userToFollow) {
      res.json({ success: false, message: "No user found" });
    }
    // AuthenticatedModel.follow method here
    // adding the user to the following list of the authenticated user
    authenticatedUser.follow(userToFollow);
    res.json({ success: true, message: "followed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

const unFollowUser = async (req, res) => {
  const { _id, unfollow_id } = req.body;
  // fetching the user
  const authenticatedUser = await AuthenticatedUserModel.findById(_id);
  // fetching the user to be unfollow
  const userToUnfollow = await AuthenticatedUserModel.findById(unfollow_id);

  try {
    if (!authenticatedUser) {
      res.json({ success: false, message: "No user found" });
    }
    if (!userToUnfollow) {
      res.json({ success: false, message: "No user found" });
    }
    // AuthenticatedModel.unFollow method here
    // removing the user from the following list of the authenticated user
    authenticatedUser.unfollow(userToUnfollow);
    res.json({ success: true, message: "unfollowed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

// dont delete

module.exports = {
  // CRUD Model routes
  initializeModel,
  fetchUser,
  editModel,
  deleteModel,
  // social routes
  getFriendsData,
  followUser,
  unFollowUser,
};
