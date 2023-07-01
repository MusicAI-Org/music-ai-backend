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

router.post("/upload", upload.single("musicFile"), async (req, res) => {
  // used for frontend
  // route complete
  userAuthController.userController.authCommunityController.uploadMusic(
    req,
    res
  );
});

// ========================== read particular music route ========================== //
//! ========================== DEPRECATED ========================== //
router.get("/:id", async (req, res) => {
  userAuthController.userController.authCommunityController.readMusic(req, res);
});
//! =================================================================== //

// ========================== read all music route ========================== //
router.get("/user/:id", async (req, res) => {
  userAuthController.userController.authCommunityController.readAllMusic(
    req,
    res
  ); // used for frontend
});

// ========================== add synths and any update music route ========================== //
router.post("/update/:id", upload.single("musicFile"), async (req, res) => {
  userAuthController.userController.authCommunityController.updateMusic(
    // used for frontend
    // route complete
    req,
    res
  );
});

// ========================== delete music route ========================== //
router.post("/delete/:id", async (req, res) => {
  userAuthController.userController.authCommunityController.deleteMusic(
    // used for frontend
    // route complete
    req,
    res
  );
});

// ========================== likes and dislikes music route ========================== //
router.post("/like", async (req, res) => {
  userAuthController.userController.authCommunityController.likeMusic(
    // used for frontend
    // route complete
    req,
    res
  );
});

router.post("/dislike", async (req, res) => {
  userAuthController.userController.authCommunityController.dislikeMusic(
    // used for frontend
    // route complete
    req,
    res
  );
});

// ========================== incrementing views music route ========================== //
router.post("/views", async (req, res) => {
  userAuthController.userController.authCommunityController.viewsMusic(
    // used for frontend
    // route complete
    req,
    res
  );
});

module.exports = router;
