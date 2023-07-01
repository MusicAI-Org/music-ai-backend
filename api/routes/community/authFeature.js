/**
 @ routes for authenticated users, protected by jwtcheck
 */

const router = require("express").Router();
const userAuthController = require("../../controllers/index");

router.post("/create", (req, res) => { // used for frontend
  userAuthController.userController.authCommunityFeatures.createCommunity(
    // route complete
    req,
    res
  );
});

router.get("/data-except-user-comm/:id", (req, res) => { // used for frontend
  userAuthController.userController.authCommunityFeatures.fetchAllCommunityDataExceptJoined(
    // route complete
    req,
    res
  );
});

router.post("/join", (req, res) => { // used for frontend
  userAuthController.userController.authCommunityFeatures.joinCommunity(
    // route complete
    req,
    res
  );
});

router.post("/leave", (req, res) => { // used for frontend
  userAuthController.userController.authCommunityFeatures.leaveCommunity(
    // route complete
    req,
    res
  );
});

router.post("/delete", (req, res) => { // used for frontend
  userAuthController.userController.authCommunityFeatures.deleteCommunity(
    // route complete
    req,
    res
  );
});

router.get("/data/:id", (req, res) => { // used for frontend
  userAuthController.userController.authCommunityFeatures.fetchCommunityDataByID(
    // route complete
    req,
    res
  );
});

router.get("/data-user/:id", (req, res) => { // used for frontend
  userAuthController.userController.authCommunityFeatures.fetchAllCommunitiesOfUser(
    // route complete
    req,
    res
  );
});

module.exports = router;
