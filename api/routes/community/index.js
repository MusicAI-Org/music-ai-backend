// import the user.routes.js routes here
const router = require("express").Router();

const authFriendRouter = require("./authFriends");
const authMusicRouter = require("./music/authMusicRoutes");
const authSearchEngine = require("./authSearchEngine");
const authSocialStats = require("./authSocialStats");
const jwtCheck = require("../../middlewares/AuthMiddleware");

// jwt-pipeline for auth routes
// jwtcheck here
router.use("/friends", authFriendRouter); // route complete
router.use("/music", authMusicRouter); // route complete
router.use("/search", authSearchEngine);
router.use("/stats", authSocialStats);

module.exports = router;
