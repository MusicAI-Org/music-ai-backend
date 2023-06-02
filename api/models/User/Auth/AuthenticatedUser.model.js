const { mongoose, Schema, model } = require("mongoose");

const AuthenticatedUserSchema = Schema(
  {
    _id: Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
    },
    role: String, // from noob to advaced based on the points
    yearOfJoining: String,
    dateOfBirth: String,
    avatarName: {
      type: String,
      // unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
    },
    password: {
      type: String,
      required: true,
    },
    genre: [
      {
        type: String,
        // required: true,
      },
    ],
    avatarImg: {
      type: String,
      // required: true,
    },
    phoneNumber: {
      type: String,
      maxlength: 13,
      minlength: 10,
    },
    creditsForGraph: [
      {
        type: Number,
        default: 0,
      },
    ],
    creditsForGraphUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    // includes audio and video both
    music: [
      { type: mongoose.Schema.Types.ObjectId, ref: "MusicAuthenticatedModel" },
    ],
    likedMusic: [
      // this is to count the total number of likes the user has done to the music
      { type: mongoose.Schema.Types.ObjectId, ref: "MusicAuthenticatedModel" },
    ],
    statsData: [
      { type: mongoose.Schema.Types.ObjectId, ref: "UserStats.model" },
    ],
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AuthenticatedUserModel" },
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AuthenticatedUserModel" },
    ],
    friends: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AuthenticatedUserModel" },
    ],
    friendRequests: [
      {
        fromUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AuthenticatedUserModel",
        },
        avatarImg: String,
        name: String,
        status: String,
      },
    ],
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        // required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    oneToOneChats: [
      {
        withUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AuthenticatedUserModel",
        },
        chats: [
          { type: mongoose.Schema.Types.ObjectId, ref: "OneToOneChatModel" },
        ],
      },
    ],
    groupChats: [
      {
        group: { type: mongoose.Schema.Types.ObjectId, ref: "GroupModel" },
        chats: [
          { type: mongoose.Schema.Types.ObjectId, ref: "GroupChatModel" },
        ],
      },
    ],
    communities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MusicCommunityModel",
      },
    ],
  },
  { collection: "Users" }
);

AuthenticatedUserSchema.index({ location: "2dsphere" });

require("./Statics/AuthMethods.js")(AuthenticatedUserSchema);
require("./Methods/BasicMethods.js")(AuthenticatedUserSchema);
require("./Methods/FollowersMethods.js")(AuthenticatedUserSchema);

const AuthenticatedUserModel = model(
  "AuthenticatedUserModel",
  AuthenticatedUserSchema
);
module.exports = AuthenticatedUserModel;
