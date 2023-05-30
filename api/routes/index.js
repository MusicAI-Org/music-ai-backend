const router = require("express").Router();

const testRouter = require("./test.routes");
const musicRouter = require("./music/index");
const communityRouter = require("./community/index");
const authRouter = require("./auth/userAuthData.routes");

// app routes
router.use("/auth", authRouter); // route complete
router.use("/music", musicRouter); // used for frontend
router.use("/community", communityRouter);

// testing routes
router.use("/test", testRouter);

module.exports = router;
