/**
 @ routes for authenticated users, protected by jwtcheck
 */

const router = require("express").Router();
const userAuthController = require("../../controllers/index");

// ========================== user routes ========================== //
// case : create and saving the model in the database and returning the data
router.post("/createmodel", (req, res) => {
  userAuthController.userController.authUserController.initializeModel( // used for frontend
    req,
    res
  );
});

router.post("/getModel", (req, res) => {
  userAuthController.userController.authUserController.fetchUser(req, res); // used for frontend
});

router.post("/editmodel", (req, res) => {
  userAuthController.userController.authUserController.editModel(req, res);
});

router.post("/deletemodel", (req, res) => {
  userAuthController.userController.authUserController.deleteModel(req, res); // used for frontend
});

router.post("/disablemodel", (req, res) => {
  userAuthController.userController.authUserController.disableModel(req, res); // used for frontend
});

// ========================== social routes ========================== //
router.get("/getfriendsdata/:id", (req, res) => {
  userAuthController.userController.authUserController.getFriendsData(req, res); // used for frontend
});

router.get("/getrandomuserdata/:id", (req, res) => {
  userAuthController.userController.authUserController.getRandomData(req, res); // used for frontend
});

// ========================== following and unfollowing routes ========================== //
router.post("/followuser", (req, res) => {
  userAuthController.userController.authUserController.followUser(req, res);
});

router.post("/unfollowuser", (req, res) => {
  userAuthController.userController.authUserController.unFollowUser(req, res);
});

module.exports = router;
