// controller for sending the auth user data using AuthModel
// and the user id
// @params: id
// @return: user data
const MongoClient = require("mongodb").MongoClient;
const AuthenticatedUserModel = require("../../../models/User/Auth/AuthenticatedUser.model.js");

// ===================== create controller ===================== //
// open end-points
// for creating the new user in ecosystem
const initializeModel = async (req, res) => {
  const {
    email,
    name,
    role,
    dateOfBirth,
    avatarName,
    genre,
    avatarImg,
    phoneNumber,
    address,
    location,
  } = req.body;
  const url = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;

  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("basicusers");
    const docs = await col.find({ email: email }).toArray();
    // creating the authenticateduser model here
    if (!docs[0]) {
      res.json({
        success: false,
        err: "Please login to google to create the model",
      });
    }
    const user = new AuthenticatedUserModel({
      _id: docs[0]._id,
      name: name,
      role: role,
      yearOfJoining: new Date().getFullYear(),
      dateOfBirth: dateOfBirth,
      avatarName: avatarName,
      email: docs[0].email,
      password: docs[0].password,
      genre: genre,
      avatarImg: avatarImg,
      phoneNumber: phoneNumber,
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
      location: location,
    });

    // delete password from the user
    delete user.password;
    await user.save();
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
  // edit the user model
  const {
    _id,
    name,
    dateOfBirth,
    avatarName,
    genre,
    avatarImg,
    phoneNumber,
    address,
  } = req.body;
  try {
    // code to edit the model
    const user = await AuthenticatedUserModel.findByIdAndUpdate(
      _id,
      {
        name,
        dateOfBirth,
        avatarName,
        genre,
        avatarImg,
        phoneNumber,
        address,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "No user found" });
    }

    res.json({ success: true, user });
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
  const { _id } = req.body;
  // find the users that are friends of the users
  const friends = AuthenticatedUserModel.find(
    { _id: { $ne: _id }, friends: { $eq: _id } },
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
    }
  );

  try {
    if (!friends) {
      res.json({ success: false, message: "No user found" });
    }
    res.json({ success: true, friends });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

const otherUsersData = async (req, res) => {
  const { _id } = req.body;
  const usersNotFriends = AuthenticatedUserModel.find(
    { _id: { $ne: _id }, friends: { $ne: _id } },
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
      followers: 1,
      following: 1, // WILL BE USED LATER IN K NEAREST NEIGHBOUR
    },
    { limit: 100 }
  );

  try {
    if (!usersNotFriends) {
      res.json({ success: false, message: "No user found" });
    }
    res.json({ success: true, usersNotFriends });
  } catch (err) {
    res
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
  otherUsersData,
  followUser,
  unFollowUser,
};