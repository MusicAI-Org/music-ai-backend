/**
 @ routes for authenticated users, protected by jwtcheck
 */

const router = require("express").Router();
const userAuthController = require("../../controllers/index");

router.get("/create", (req, res) => {
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

router.get("/join", (req, res) => {
  userAuthController.userController.authCommunityFeatures.joinCommunity(
    // route complete
    req,
    res
  );
});

router.get("/leave", (req, res) => {
  userAuthController.userController.authCommunityFeatures.leaveCommunity(
    // route complete
    req,
    res
  );
});

router.get("/delete", (req, res) => {
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

module.exports = router;
