// controller for sending the basic user data using BasicUser model
// and the user id
// @params: id
// @return: user data

// open end-points
// this route will be called automatically on the front page so that user has to login to spotify first then can see data
const { google } = require("googleapis");
const AuthenticatedUserModel = require("../../../models/User/Auth/AuthenticatedUser.model");
require("dotenv").config();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

const getBasicMusicData = async (req, res) => {
  const currentYear = new Date().getFullYear();
  try {
    // Fetch most popular music videos
    const mostPopular = youtube.videos.list({
      part: "snippet,statistics",
      chart: "mostPopular",
      q:`Most Popular Music`,
      maxResults: 20,
    });
    // Fetch top tracks
    const topTracks = youtube.search.list({
      part: "snippet",
      type: "video",
      q: `Top tracks ${currentYear}`,
      maxResults: 20,
    });
    // Fetch top artists
    const topArtists = youtube.search.list({
      part: "snippet",
      type: "channel",
      q: `Top artists ${currentYear}`,
      maxResults: 20,
    });

    // Fetch top albums
    const topAlbums = youtube.search.list({
      part: "snippet",
      type: "album",
      q: `Top albums ${currentYear}`,
      maxResults: 20,
    });

    const combinedData = await Promise.all([
      mostPopular,
      topTracks,
      topArtists,
      topAlbums,
    ]);
    const mostPopularData = combinedData[0].data.items;
    const topTracksData = combinedData[1].data.items;
    const topArtistsData = combinedData[2].data.items;
    const topAlbumsData = combinedData[3].data.items;

    const data = {
      mostPopularData,
      topTracksData,
      topArtistsData,
      topAlbumsData,
    };

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from YouTube Music API", error);
    res.status(500).json({ error: "Unable to fetch music data" });
  }
};

const getOtherUserData = async (req, res) => {
  try {
    // fetch all users from the database
    const users = await AuthenticatedUserModel.find({}).select("name location");

    // send the data to the front end
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getBasicMusicData,
  getOtherUserData,
};
