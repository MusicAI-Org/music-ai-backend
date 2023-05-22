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
const cache = new Map(); // Initialize a cache

const getAuthMusic = async (req, res) => {
  const { id } = req.params;

  // Check if data exists in the cache
  const cacheKey = `authMusicData_${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    // If data exists in the cache, return it as response
    console.log("Data retrieved from cache");
    res.status(200).json(cachedData);
    return; // Exit the function
  }

  try {
    // Fetch user with genre and friends data from the database in a single query
    const user = await AuthenticatedUserModel.findById(id)
      .populate({
        path: "friends",
        select: "genre",
      })
      .select("genre friends")
      .exec();

    console.log("frrrrr", user.friends);

    const musicListBasedOnGenre = await fetchMusicList(user.genre, 5);
    const musicListBasedOnFriendsGenre =
      user.friends.length > 0 ? await fetchFriendsMusicList(user.friends) : [];

    // Create an object with the fetched data
    const responseData = {
      success: true,
      musicListBasedOnGenre,
      musicListBasedOnFriendsGenre,
    };

    // Store the fetched data in the cache
    cache.set(cacheKey, responseData);

    // Send the data to the frontend
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const fetchMusicList = async (genres, maxResults) => {
  const musicList = [];
  const promises = genres.map(async (genre) => {
    const topTracks = await youtube.search.list({
      part: "snippet",
      type: "video",
      q: `Top tracks ${genre}`,
      maxResults,
    });
    musicList.push(topTracks.data.items);
  });

  await Promise.all(promises);
  return musicList;
};

const fetchFriendsMusicList = async (friends) => {
  const musicList = [];
  for (const friend of friends) {
    for (const genre of friend.genre) {
      const topTracks = await youtube.search.list({
        part: "snippet",
        type: "video",
        q: `Top tracks ${genre}`,
        maxResults: 5,
      });
      musicList.push(topTracks.data.items);
    }
  }
  return musicList;
};

// fetch the data for the globe including the friends and not friends users
const getAuthGlobeData = async (req, res) => {
  console.log("other user data for rendering to the globe");

  try {
    const userId = req.body._id;

    // Fetch users that are not friends and not the current user or their friends
    const usersNotFriends = await AuthenticatedUserModel.find({
      $and: [
        { _id: { $ne: userId } },
        { friends: { $nin: userId } },
        { "friends._id": { $ne: userId } },
      ],
    })
      .select("_id name avatarName avatarImg address location")
      .exec();

    // Users that are friends
    const usersFriends = await AuthenticatedUserModel.find({
      friends: userId,
    })
      .select("_id name avatarName avatarImg address location")
      .exec();

    // Send the data to the frontend
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
