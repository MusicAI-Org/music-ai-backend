// const basicUserController = require("./basicUserControllers");
const authUserController = require("./Auth/authUserControllers");

const basicMusicController = require("./Music/basicMusicController");
const authMusicController = require("./Music/authMusicController");

const authCommunityController = require("./Community/authCommunityController");
const authCommunityFeatures = require("./Community/authCommunityFeatures");

module.exports = {
  // auth controllers
  // basicUserController,
  authUserController,
  // music controllers
  basicMusicController,
  authMusicController,
  // community controller
  authCommunityController,
  authCommunityFeatures
};
