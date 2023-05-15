// controller for sending the basic user data using BasicUser model
// and the user id
// @params: id
// @return: user data

// open end-points
// this route will be called automatically on the front page so that user has to login to spotify first then can see data
const { google } = require("googleapis");
const AuthenticatedUserModel = require("../../../models/User/Auth/AuthenticatedUser.model");
const YoutubeDataModel = require("../../../models/YoutubeData/YoutubeData.model");
const NodeCache = require("node-cache");
const cache = new NodeCache();
const schedule = require("node-schedule");
require("dotenv").config();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

const getBasicMusicData = async (req, res) => {
  const currentYear = new Date().getFullYear();
  try {
    // Check if data exists in the cache
    const cacheKey = "youtubeData";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // If data exists in the cache, return it as response
      console.log("Data retrieved from cache");
      res.status(200).json(cachedData);
    } else {
      // If data does not exist in the cache, fetch data from YouTube API
      console.log("Data not found in cache");
      const mostPopular = youtube.videos.list({
        part: "snippet,statistics",
        chart: "mostPopular",
        q: `Most Popular Music`,
        maxResults: 20,
      });
      const topTracks = youtube.search.list({
        part: "snippet",
        type: "video",
        q: `Top music tracks ${currentYear}`,
        maxResults: 20,
      });
      const topArtists = youtube.search.list({
        part: "snippet",
        type: "channel",
        q: `Top music artists ${currentYear}`,
        maxResults: 20,
      });
      const topAlbums = youtube.search.list({
        part: "snippet",
        type: "album",
        q: `Top music albums ${currentYear}`,
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

      // Store fetched data in cache with a time-to-live (TTL) of 24 hours
      const newData = {
        mostPopularData,
        topTracksData,
        topArtistsData,
        topAlbumsData,
      };
      cache.set(cacheKey, newData, 24 * 60 * 60);

      // Create a scheduled task to renew the data in the cache after 24 hours
      schedule.scheduleJob("0 0 * * *", async () => {
        console.log("Data in cache expired, renewing...");
        const mostPopular = youtube.videos.list({
          part: "snippet,statistics",
          chart: "mostPopular",
          q: `Most Popular Music`,
          maxResults: 20,
        });
        const topTracks = youtube.search.list({
          part: "snippet",
          type: "video",
          q: `Top music tracks ${currentYear}`,
          maxResults: 20,
        });
        const topArtists = youtube.search.list({
          part: "snippet",
          type: "channel",
          q: `Top music artists ${currentYear}`,
          maxResults: 20,
        });
        const topAlbums = youtube.search.list({
          part: "snippet",
          type: "album",
          q: `Top music albums ${currentYear}`,
          maxResults: 20,
        });

        const renewedData = await Promise.all([
          mostPopular,
          topTracks,
          topArtists,
          topAlbums,
        ]);
        const renewedMostPopularData = renewedData[0].data.items;
        const renewedTopTracksData = renewedData[1].data.items;
        const renewedTopArtistsData = renewedData[2].data.items;
        const renewedTopAlbumsData = renewedData[3].data.items;

        // Update the data in the cache with renewed data
        const updatedData = {
          mostPopularData: renewedMostPopularData,
          topTracksData: renewedTopTracksData,
          topArtistsData: renewedTopArtistsData,
          topAlbumsData: renewedTopAlbumsData,
        };
        cache.set(cacheKey, updatedData, 24 * 60 * 60);
        console.log("Data in cache renewed");
      });

      // Return the fetched data as response
      res.status(200).json(newData);
    }
  } catch (error) {
    console.error("Failed to fetch data from YouTube API", error);
    res.status(500).json({ message: "Failed to fetch data from YouTube API" });
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
