/**
 @ routes for authenticated users, protected by jwtcheck
 */

 const router = require("express").Router();
 const userAuthController = require("../../controllers/index");
 
 // ========================== stats data to fetch all the music related data on frontend ========================== //
 router.get("/:id", (req, res) => {
   userAuthController.userController.authCommunityController.getStatsData(req, res); // used for frontend
 });
 
 module.exports = router;
 