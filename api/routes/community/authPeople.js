/**
 @ routes for authenticated users, protected by jwtcheck
 */

const router = require("express").Router();
const userAuthController = require("../../controllers/index");

// ========================== fetch people based on different criteria ========================== //
router.post("/nearBy", (req, res) => {
  userAuthController.userController.authCommunityController.nearbyFetch( // route complete
    req,
    res
  );
});

router.post("/likeBased", (req, res) => {
  userAuthController.userController.authCommunityController.likedBased( // route complete
    req,
    res
  );
});

router.post("/genreBased", (req, res) => {
  userAuthController.userController.authCommunityController.genreBased( // route complete
    req,
    res
  );
});

router.post("/friendsOfFriends", (req, res) => {
  userAuthController.userController.authCommunityController.friendsOfFriends( // route complete
    req,
    res
  );
});

// ========================== create friends ========================== //
router.post("/addFriend", (req, res) => {
  userAuthController.userController.authCommunityController.addFriend(req, res); // route complete
});

module.exports = router;
