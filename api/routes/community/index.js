// import the user.routes.js routes here
const router = require("express").Router();

const authFeatureRouter = require("./authFeature");
const authPeopleRouter = require("./authPeople");
const authMusicRouter = require("./music/authMusicRoutes");
const authSearchEngine = require("./authSearchEngine");
const authSocialStats = require("./authSocialStats");
const jwtCheck = require("../../middlewares/AuthMiddleware");

// jwt-pipeline for auth routes
// jwtcheck here
router.use("/features", authFeatureRouter); // used for frontend
router.use("/people", authPeopleRouter); // used for frontend
router.use("/music", authMusicRouter); // used for frontend
router.use("/search", authSearchEngine);
router.use("/stats", authSocialStats);

module.exports = router;
