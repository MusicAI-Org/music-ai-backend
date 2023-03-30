const { mongoose, Schema, model } = require("mongoose");
const { Schema } = mongoose;

// Define community schema
const MusicCommunitySchema = new Schema(
  {
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
  },
  { collection: "MusicCommunities" }
);

const MusicCommunityModel = model("MusicCommunityModel", MusicCommunitySchema);
module.exports = MusicCommunityModel;
