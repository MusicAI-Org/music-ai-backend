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
router.use("/features", authFeatureRouter);
router.use("/people", authPeopleRouter); // used for frontend (fetches the users based on some parameters)
router.use("/music", authMusicRouter); // route complete (fetches music of friends, followers, community, genre)
router.use("/search", authSearchEngine);
router.use("/stats", authSocialStats);

module.exports = router;
