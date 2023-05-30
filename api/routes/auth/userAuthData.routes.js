/**
 @ routes for authenticated users, protected by jwtcheck
 */

const router = require("express").Router();
const userAuthController = require("../../controllers/index");

// ========================== user routes ========================== //
// case : create and saving the model in the database and returning the data
router.post("/createmodel", (req, res) => {
  userAuthController.userController.authUserController.initializeModel( // done
    req,
    res
  );
});

router.post("/getModel", (req, res) => {
  userAuthController.userController.authUserController.fetchUser(req, res); // done
});

router.post("/editmodel", (req, res) => {
  userAuthController.userController.authUserController.editModel(req, res);
});

router.delete("/deletemodel", (req, res) => {
  userAuthController.userController.authUserController.deleteModel(req, res);
});

// router.delete("/disablemodel", (req, res) => {
//   userAuthController.userController.authUserController.disableModel(req, res);
// });

// ========================== social routes ========================== //
router.get("/getfriendsdata/:id", (req, res) => {
  userAuthController.userController.authUserController.getFriendsData(req, res);
});

// ========================== following and unfollowing routes ========================== //
router.post("/followuser", (req, res) => {
  userAuthController.userController.authUserController.followUser(req, res);
});

router.post("/unfollowuser", (req, res) => {
  userAuthController.userController.authUserController.unFollowUser(req, res);
});

module.exports = router;
