const { mongoose, Schema, model } = require("mongoose");

// Define community schema
const MusicCommunitySchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "AuthenticatedUserModel",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AuthenticatedUserModel",
      required: true,
    },
    chat: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "AuthenticatedUserModel",
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    imgUrl: {
      type: String,
      required: true,
    },
  },
  { collection: "MusicCommunities" }
);

const MusicCommunityModel = model("MusicCommunityModel", MusicCommunitySchema);
module.exports = MusicCommunityModel;
