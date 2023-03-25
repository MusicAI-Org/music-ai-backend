/**
 @ routes for authenticated users, protected by jwtcheck
 */

const { Grid } = require("gridfs-stream");
const { MongoClient } = require("mongodb");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const { Readable } = require("stream");

const router = require("express").Router();
const upload = multer({ storage: multer.memoryStorage() });
const userAuthController = require("../../../controllers/index");

// ========================== upload music route ========================== //

router.post("/upload", upload.single("musicFile"), async (req, res) => { // route complete
  userAuthController.userController.authCommunityController.uploadMusic(
    req,
    res
  );
});

// ========================== read music route ========================== //
router.get("/:id", async (req, res) => {
  userAuthController.userController.authCommunityController.readMusic(req, res); // route complete
});

// ========================== update music route ========================== //
router.post("/update/:id", async (req, res) => {
  userAuthController.userController.authCommunityController.updateMusic( // route complete
    req,
    res
  );
});

// ========================== delete music route ========================== //
router.post("/delete/:id", async (req, res) => {
  userAuthController.userController.authCommunityController.deleteMusic( // route complete
    req,
    res
  );
});

// ========================== likes and dislikes music route ========================== //
router.post("/like", async (req, res) => {
  userAuthController.userController.authCommunityController.likeMusic( // route complete
    req,
    res
  );
})

router.post("/dislike", async (req, res) => {
  userAuthController.userController.authCommunityController.dislikeMusic( // route complete
    req,
    res
  );
})

module.exports = router;
