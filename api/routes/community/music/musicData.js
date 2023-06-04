/**
 @ routes for authenticated users, protected by jwtcheck
 */

 const router = require("express").Router();
 const userAuthController = require("../../../controllers/index");
 
 // ========================== fetches from the search engine ========================== //
 router.get("/:id", (req, res) => {
   userAuthController.userController.authCommunityController.fetchMLbasedMusic(req, res); // route complete
 });
 
 module.exports = router;
 