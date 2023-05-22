/**
 @ routes for authenticated users, protected by jwtcheck
 */

 const router = require("express").Router();
 const userAuthController = require("../../../controllers/index");
 
 // ========================== route to send the music for home page ========================== //
 router.get("/getAuthMusic/:id", (req, res) => {
   userAuthController.userController.authMusicController.getAuthMusic(req, res); // route complete
 });
 
 // ========================== globedata to fetch all the users in db and display on the map ========================== //
 router.post("/globeAuthData", (req, res) => { // route complete
   userAuthController.userController.authMusicController.getAuthGlobeData(req, res); // route complete
 });
 
 module.exports = router;
 