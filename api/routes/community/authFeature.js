/**
 @ routes for authenticated users, protected by jwtcheck
 */

const router = require("express").Router();
const userAuthController = require("../../controllers/index");

router.post("/create", (req, res) => {
  userAuthController.userController.authCommunityFeatures.createCommunity(
    // route complete
    req,
    res
  );
});

router.get("/data", (req, res) => {
  userAuthController.userController.authCommunityFeatures.fetchAllCommunityData(
    // route complete
    req,
    res
  );
});

router.post("/join", (req, res) => {
  userAuthController.userController.authCommunityFeatures.joinCommunity(
    // route complete
    req,
    res
  );
});

router.post("/leave", (req, res) => {
  userAuthController.userController.authCommunityFeatures.leaveCommunity(
    // route complete
    req,
    res
  );
});

router.post("/delete", (req, res) => {
  userAuthController.userController.authCommunityFeatures.deleteCommunity(
    // route complete
    req,
    res
  );
});

router.get("/data/:id", (req, res) => {
  userAuthController.userController.authCommunityFeatures.fetchCommunityDataByID(
    // route complete
    req,
    res
  );
});

router.get("/data-user/:_id", (req, res) => {
  userAuthController.userController.authCommunityFeatures.fetchAllCommunitiesOfUser(
    // route complete
    req,
    res
  );
});

module.exports = router;
