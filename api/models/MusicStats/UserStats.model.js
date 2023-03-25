const { mongoose, Schema, model } = require("mongoose");

const UserStatsSchema = Schema(
  {
    _id: Schema.Types.ObjectId,
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AuthenticatedUserModel" },
    ],
    music: [{ type: mongoose.Schema.Types.ObjectId, ref: "MusicUpload.model" }],
  },
  { collection: "UserStats" }
);

// require("./Methods/BasicMethods.js")(UserStatsSchema);
require("./Methods/FollowersMethods.js")(UserStatsSchema);

const UserStatsModel = model("AuthenticatedUserModel", UserStatsSchema);
module.exports = UserStatsModel;
