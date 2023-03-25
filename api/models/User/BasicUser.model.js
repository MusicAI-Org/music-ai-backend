const { Schema, model } = require("mongoose");
const BasicUser = Schema({
  _id: Schema.Types.ObjectId,
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
  },
  password: { type: String, required: true },
  genre: {
    type: String,
  },
  songsForAll: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  recentlyPlayedSongs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song",
    },
  ],

  playlists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
});

const BasicUserSchema = model("BasicUser", BasicUser);
module.exports = BasicUserSchema;
