// controller for sending the basic user data using BasicUser model
// and the user id
// @params: id
// @return: user data
const { google } = require("googleapis");
const AuthenticatedUserModel = require("../../../models/User/Auth/AuthenticatedUser.model");
require("dotenv").config();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// authenticated end-point
const getAuthMusic = async (req, res) => {
  const { _id } = req.body;

  // fetch genre from the id using model and populate the friends

  const user = await AuthenticatedUserModel.findById(_id)
    .populate("friends")
    .select("genre friends")
    .exec();

  let flagCheck = user.friends.length > 0 ? true : false;

  // fetch music from the youtube api based on the genre and send the data to the frontend
  try {
    // create a list and iterate through the genre array and fetch the data from the corresponding the youtube list
    // and push the data to the list
    const musicListBasedOnGenre = [];
    for (let i = 0; i < user.genre.length; i++) {
      const topTracks = await youtube.search.list({
        part: "snippet",
        type: "video",
        q: `Top tracks ${user.genre[i]}`,
        maxResults: 5,
      });
      // console.log(topTracks)
      musicListBasedOnGenre.push(topTracks.data.items);
    }

    // ============ create a list and iterate through the genre array and fetch the data from the corresponding the youtube list =======
    // and push the data to the list
    const musicListBasedOnFriendsGenre = [];
    if (flagCheck) {
      for (let i = 0; i < user.friends.genre.length; i++) {
        const topTracks = await youtube.search.list({
          part: "snippet",
          type: "video",
          q: `Top tracks ${user.friends.genre[i]}`,
          maxResults: 5,
        });
        musicListBasedOnFriendsGenre.push(topTracks.data.items);
      }
    }

    // send the data to the frontend
    res.status(200).json({
      success: true,
      musicListBasedOnGenre,
      musicListBasedOnFriendsGenre,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// fetch the data for the globe including the friends and not friends users
const getAuthGlobeData = async (req, res) => {
  console.log("other user data for rendering to the globe");

  try {
    // fetch all users from the database that are not friends
    // and are not the current user
    // const usersNotFriends = await AuthenticatedUserModel.find({
    //   _id: req.body._id,
    // })
    //   .select("_id name avatarImg address location")
    //   .exec();
    const usersNotFriends = await AuthenticatedUserModel.find({
      _id: { $ne: req.body._id },
    })
      .select("_id name avatarImg address location")
      .exec();

    // users that are friends
    const usersFriends = await AuthenticatedUserModel.find({
      _id: { $ne: req.body._id },
      friends: { $eq: req.body._id },
    })
      .select("_id name avatarImg address location")
      .exec();

    // send the data to frontend
    res.status(200).json({
      usersNotFriends,
      usersFriends,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAuthMusic,
  getAuthGlobeData,
};
