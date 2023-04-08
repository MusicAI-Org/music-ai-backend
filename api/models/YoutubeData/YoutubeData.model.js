const mongoose = require("mongoose");
const { Schema } = mongoose;

const YoutubeDataSchema = new Schema({
  mostPopularData: Array,
  topTracksData: Array,
  topArtistsData: Array,
  topAlbumsData: Array,
});

const YoutubeDataModel = mongoose.model("YoutubeData", YoutubeDataSchema);

module.exports = YoutubeDataModel;
