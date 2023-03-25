/**
 @ routes for authenticated users, protected by jwtcheck
 */

 const router = require("express").Router();
 const userAuthController = require("../../../controllers/index");
 
 // ========================== basic user routes without auth ========================== //
 router.get("/getAuthMusic", (req, res) => {
   userAuthController.userController.authMusicController.getAuthMusic(req, res); // route complete
 });
 
 // ========================== globedata to fetch all the users in db and display on the map ========================== //
 router.get("/globeAuthData", (req, res) => { // route complete
   userAuthController.userController.authMusicController.getAuthGlobeData(req, res); // route complete
 });
 
 module.exports = router;
 