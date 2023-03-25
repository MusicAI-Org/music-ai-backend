/**
 @ routes for authenticated users, protected by jwtcheck
 */

const router = require("express").Router();
const userAuthController = require("../../controllers/index");

// ========================== user routes ========================== //
// case : create and saving the model in the database and returning the data
router.post("/createmodel", (req, res) => {
  userAuthController.userController.authUserController.initializeModel(
    req,
    res
  );
});

router.get("/getUser", (req, res) => {
  userAuthController.userController.authUserController.fetchUser(req, res);
});

router.post("/editmodel", (req, res) => {
  userAuthController.userController.authUserController.editModel(req, res);
});

router.delete("/deletemodel", (req, res) => {
  userAuthController.userController.authUserController.deleteModel(req, res);
});

// ========================== social routes ========================== //
router.get("/getfriendsdata", (req, res) => {
  userAuthController.userController.authUserController.getFriendsData(req, res);
});

router.get("/getotherusersdata", (req, res) => {
  userAuthController.userController.authUserController.otherUsersData(req, res);
});

// ========================== following and unfollowing routes ========================== //
router.post("/followuser", (req, res) => {
  userAuthController.userController.authUserController.followUser(req, res);
});

router.post("/unfollowuser", (req, res) => {
  userAuthController.userController.authUserController.unFollowUser(req, res);
});

module.exports = router;
