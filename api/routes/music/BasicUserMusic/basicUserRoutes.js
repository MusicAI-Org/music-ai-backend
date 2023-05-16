/**
 @ routes for authenticated users, protected by jwtcheck
 */

const router = require("express").Router();
const basicUserController = require("../../../controllers/index");

// ========================== basic user routes without auth ========================== //
router.get("/getBasicMusic", (req, res) => {
    basicUserController.userController.basicMusicController.getBasicMusicData(req, res);
});

// ========================== globedata to fetch all the users in db and display on the map ========================== //
router.post("/allGlobeData", (req, res) => {
    basicUserController.userController.basicMusicController.getOtherUserData(req, res);
});

module.exports = router;
