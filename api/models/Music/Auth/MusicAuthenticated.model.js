const mongoose = require("mongoose");

const MusicSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    songname: {
      type: String,
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthenticatedUserModel",
    },
    albumname: {
      type: String,
      required: true,
    },
    genre: [
      {
        type: String,
        required: true,
      },
    ],
    format: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AuthenticatedUserModel" },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AuthenticatedUserModel" },
    ],
    dislikesCount: {
      type: Number,
      default: 0,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "CommentModel" }],
    views: {
      type: Number,
      default: 0,
    },
  },
  { collection: "Musics" }
);

require("./Methods/Methods.js")(MusicSchema);

const MusicAuthenticatedModel = mongoose.model("MusicAuthenticatedModel", MusicSchema);
module.exports = MusicAuthenticatedModel;
