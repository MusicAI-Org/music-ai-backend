// import the user.routes.js routes here
const router = require("express").Router();

const fetchMusicRouter = require("./musicData");
const musicRouter = require("./music");

// jwt-pipeline for auth routes
// jwtcheck here
router.use("/fetchMusic", fetchMusicRouter); // used for frontend
router.use("/", musicRouter); // used for frontend

module.exports = router;
