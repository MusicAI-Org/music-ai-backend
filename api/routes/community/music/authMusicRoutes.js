// import the user.routes.js routes here
const router = require("express").Router();

const fetchMusicRouter = require("./musicData");
const uploadMusicRouter = require("./uploadMusic");

// jwt-pipeline for auth routes
// jwtcheck here
router.use("/fetchMusic", fetchMusicRouter); // used for frontend
router.use("/", uploadMusicRouter); // route complete

module.exports = router;
