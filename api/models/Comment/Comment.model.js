const { mongoose, Schema, model } = require("mongoose");

const commentSchema = Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthenticatedUserModel",
      required: true,
    },
    music: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MusicAuthenticatedModel",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "comments",
  }
);

const CommentModel = model("CommentModel", commentSchema);

module.exports = CommentModel;
