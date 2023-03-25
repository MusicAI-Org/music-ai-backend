/**
 @ routes for authenticated users, protected by jwtcheck
 */

 const router = require("express").Router();
 const userAuthController = require("../../controllers/index");
 
 // ========================== fetches from the search engine ========================== //
 router.get("/", (req, res) => {
   userAuthController.userController.authCommunityController.fetchSearches(req, res);
 });
 
 module.exports = router;
 