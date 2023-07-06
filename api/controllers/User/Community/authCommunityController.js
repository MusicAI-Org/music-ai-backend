const mongoose = require("mongoose");
const AuthenticatedUserModel = require("../../../models/User/Auth/AuthenticatedUser.model");
const MusicAuthenticatedModel = require("../../../models/Music/Auth/MusicAuthenticated.model");
const { Readable } = require("stream");
const { Configuration, OpenAIApi } = require("openai");

// audio storage configuration
const firebase = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require("firebase/storage");

// and the user id
// @params: id
// @return: user data
require("dotenv").config();
// ========================================== create friends ==========================================
const addFriend = async (req, res) => {
  try {
    const user1 = await AuthenticatedUserModel.findById(req.body.user1Id);
    const user2 = await AuthenticatedUserModel.findById(req.body.user2Id);
    // console.log("ididididid",user1._id);

    if (user1?.friends != null && user1?.friends?.includes(user2?._id)) {
      return res.status(200).json({ msg: "Users are already friends" });
    }

    const friendRequestSent = user2?.friendRequests?.some((request) =>
      request.fromUser.equals(req.body.user1Id)
    );

    if (friendRequestSent) {
      return res.status(200).json({ msg: "Friend request already sent" });
    }

    const existingRequestIndex = user1?.friendRequests?.findIndex((fr) =>
      fr.fromUser.equals(user2?._id)
    );
    console.log("eeee", existingRequestIndex);

    if (existingRequestIndex !== undefined && existingRequestIndex !== -1) {
      if (user1?.friendRequests[existingRequestIndex].status === "pending") {
        user1.friendRequests.splice(existingRequestIndex, 1);
        user1.friends.push(user2._id);

        const existingRequestIndex2 = user2.friendRequests.findIndex((fr) =>
          fr.fromUser.equals(user1._id)
        );

        if (existingRequestIndex2 !== -1) {
          if (
            user2.friendRequests[existingRequestIndex2].status === "pending"
          ) {
            user2.friendRequests.splice(existingRequestIndex2, 1);
          } else {
            user2.friendRequests[existingRequestIndex2].status = "accepted";
          }
        }

        const existingRequestIndex3 = user1.friendRequests.findIndex((fr) =>
          fr.fromUser.equals(user2._id)
        );

        if (existingRequestIndex3 !== -1) {
          user1.friendRequests.splice(existingRequestIndex3, 1);
        }

        const existingRequestIndex4 = user2.friendRequests.findIndex((fr) =>
          fr.fromUser.equals(user1._id)
        );

        if (existingRequestIndex4 !== -1) {
          if (
            user2.friendRequests[existingRequestIndex4].status === "pending"
          ) {
            user2.friendRequests.splice(existingRequestIndex4, 1);
          }
        } else {
          user2.friendRequests.push({
            fromUser: user1._id,
            status: "accepted",
            avatarImg: user1.avatarImg,
            name: user1.name,
          });
        }

        if (!user2.friends.includes(user1._id)) {
          user2.friends.push(user1._id);
        }

        user1.friendRequests = user1.friendRequests.filter(
          (fr) => fr.status === "pending"
        );
        user2.friendRequests = user2.friendRequests.filter(
          (fr) => fr.status === "pending"
        );

        await Promise.all([user1.save(), user2.save()]);
        res.status(200).json({ msg: "Friend added successfully" });
      } else {
        res.status(200).json({ msg: "Friend request already sent" });
      }
    } else {
      user2?.friendRequests?.push({
        fromUser: user1?._id,
        status: "pending",
        avatarImg: user1?.avatarImg,
        name: user1?.name,
      });
      await user2?.save();
      res.status(200).json({ msg: "Friend request sent successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// ========================================== user stats ==========================================
const getStatsData = async (req, res) => {
  try {
    const { id } = req.params; // Assuming you pass the user ID in the request body
    const users = await AuthenticatedUserModel.find().populate("music");

    // Calculate the metrics for each user
    const usersData = await Promise.all(
      users.map(async (user) => {
        let likesCount = 0;
        let dislikesCount = 0;
        let viewsCount = 0;

        for (const music of user.music) {
          likesCount += music.likesCount;
          dislikesCount += music.dislikesCount;
          viewsCount += music.views;
        }

        return {
          userId: user._id,
          likesCount,
          dislikesCount,
          viewsCount,
        };
      })
    );

    // Sort users by viewsCount in descending order
    const sortedUsers = usersData.sort((a, b) => b.viewsCount - a.viewsCount);

    // Determine the rank of the specified user
    const targetUserIndex = sortedUsers.findIndex(
      (user) => user.userId.toString() === id
    );
    const rank = targetUserIndex + 1; // 1-based rank

    // Update the ranks in the database for all users
    await Promise.all(
      sortedUsers.map(async (user, index) => {
        const updatedUser = await AuthenticatedUserModel.findById(user.userId);
        updatedUser.statsData = {
          likesCount: user.likesCount,
          dislikesCount: user.dislikesCount,
          viewsCount: user.viewsCount,
          rank: index + 1, // 1-based rank
        };
        await updatedUser.save();
      })
    );

    // ASSINGING ROLES TO USERS ===========================================================
    const totalUsers = await AuthenticatedUserModel.countDocuments();
    const targetUser = await AuthenticatedUserModel.findById(id).populate(
      "music"
    );
    console.log(targetUser.music);
    let likesCount = 0;
    let dislikesCount = 0;
    let viewsCount = 0;

    for (const music of targetUser.music) {
      likesCount += music.likesCount;
      dislikesCount += music.dislikesCount;
      viewsCount += music.views;
    }

    const totalRatio = (likesCount + dislikesCount) / viewsCount;
    let role = "";
    if (viewsCount == 0 || (totalRatio >= 0 && totalRatio < 0.5)) {
      role = "Novice";
    } else if (totalRatio >= 0.5 && totalRatio < 1) {
      role = "Intermediate";
    } else if (totalRatio >= 1) {
      role = "Advanced";
    }
    console.log(viewsCount);

    // Update the target user's role in the database
    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({ rank, role, likesCount, dislikesCount, viewsCount, totalUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================================================= user searches ===========================================================
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

const fetchSearches = async (req, res) => {
  try {
    const result = await openai.createCompletion({
      model: "davinci",
      prompt: "who is arman malik",
      temperature: 0,
      max_tokens: 1024,
    });
    return res.json({ result: result.data.choices[0].text });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
      return res
        .status(error.response.status)
        .json({ error: error.response.data });
    } else {
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
};

// ========================================== community routes based on following features ==========================================
// nearby fetch
const nearbyFetch = async (req, res) => {
  // code to fetch nearby users from the database
  if (!req.body._id) {
    return res.status(400).json({ msg: "Please provide the user id" });
  }
  const MAX_DISTANCE = 300000;
  const {
    _id,
    location: {
      type,
      coordinates: [longitude, latitude],
    },
  } = req.body;

  let nearByUsers = await AuthenticatedUserModel.aggregate([
    {
      $geoNear: {
        near: {
          type: type,
          coordinates: [longitude, latitude],
        },
        distanceField: "distance",
        maxDistance: MAX_DISTANCE,
        spherical: false,
      },
    },
  ]);

  nearByUsers = nearByUsers.filter(
    (user) => user._id.toString() !== _id.toString()
  );

  try {
    if (!nearByUsers) {
      res.json({ success: false, message: "No user found" });
    }
    res.json({ success: true, nearByUsers });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

// liked based fetch
const likedBased = async (req, res) => {
  const threshold = 0.5;
  const { _id } = req.body;

  // fetching the likedMusic array of the current user
  const authUser = await AuthenticatedUserModel.findById(_id).select(
    "likedMusic"
  );

  // console.log("hi there",authUser.likedMusic); // music liked by user

  try {
    const authUsers = await AuthenticatedUserModel.find({}).exec();
    const similarUsers = authUsers.filter((user) => {
      const commonLikedMusic = user.likedMusic.filter((musicId) =>
        authUser.likedMusic.includes(musicId)
      );
      // console.log("commonLikedMusic",commonLikedMusic.length / authUser.likedMusic.length >= threshold)
      return commonLikedMusic.length / authUser.likedMusic.length >= threshold;
    });

    // remove the id of the self user from the similarUsers list
    const filteredUsers = similarUsers.filter(
      (user) => user._id.toString() !== _id.toString()
    );
    // console.log("users",similarUsers)

    if (!filteredUsers) {
      res.json({ success: false, message: "No user found" });
    }
    res.json({ success: true, filteredUsers });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

// genre based fetch
const genreBased = async (req, res) => {
  const { _id } = req.body;
  const fetchUserGenre = await AuthenticatedUserModel.findById(_id);
  const fetchedUserGenre = fetchUserGenre.genre;
  const similarGenreUsers = await AuthenticatedUserModel.find({
    genre: { $in: fetchedUserGenre },
  });

  try {
    if (!similarGenreUsers) {
      res.json({ success: false, message: "No user found" });
    }
    const filteredUsers = similarGenreUsers
      .filter((user) => {
        let similarity = 0;
        user.genre.forEach((userGenre) => {
          if (fetchedUserGenre.includes(userGenre)) {
            similarity++;
          }
        });

        return similarity / fetchedUserGenre.length >= 0.5;
      })
      .filter((user) => {
        return user._id.toString() !== _id.toString();
      });
    res.json({ success: true, filteredUsers });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

// friends of friends fetch
const friendsOfFriends = async (req, res) => {
  const { _id } = req.body;
  AuthenticatedUserModel.findById(_id)
    .populate({
      path: "friends",
      populate: {
        path: "friends",
        model: "AuthenticatedUserModel",
      },
    })
    .exec((err, user) => {
      if (err) {
        console.error(err);
      } else {
        // Filter out the user itself and duplicates
        const friendsOfFriends = user.friends
          .map((friend) => friend.friends)
          .reduce((a, b) => a.concat(b), [])
          .filter((friend) => friend._id.toString() !== user._id.toString());
        res.status(200).json({
          success: true,
          friendsOfFriends,
        });
      }
    });
};

// ========================================== fetch ml music routes ==========================================
const fetchMLbasedMusic = async (req, res) => {
  const { id } = req.params;

  try {
    // ==================== code to fetch the music of user's friends with _id ======================= //
    const user = await AuthenticatedUserModel.findById(id)
      .populate("friends followers genre")
      .exec();

    const friends = user.friends;
    const music = await MusicAuthenticatedModel.find({
      artist: { $in: friends },
    });

    // ====================== code to fetch the music of followers of user with _id =================== //
    const followers = user.followers;
    const musicOfFollowers = await MusicAuthenticatedModel.find({
      artist: { $in: followers },
    });

    // ====================== code to fetch the most liked music from the database =====================//
    const mostLikedMusic = await MusicAuthenticatedModel.find({})
      .sort({ likes: -1 })
      .limit(10)
      .populate("artist", "name");

    // fetching music from database based on the genre of the user with similarity percentage >= 50%

    const userGenre = user.genre;
    const similarity = 0.5;
    const similarGenreMusic = await MusicAuthenticatedModel.find({
      genre: { $in: userGenre },
    });

    // filtering the music based on the similarity percentage
    const filteredTotalCommunityMusic = similarGenreMusic.filter((music) => {
      let similarityCount = 0;
      music.genre.forEach((musicGenre) => {
        if (userGenre.includes(musicGenre)) {
          similarityCount++;
        }
      });

      return similarityCount / userGenre.length >= similarity;
    });

    // creating an object and returning back to the user
    const musicObject = {
      music,
      musicOfFollowers,
      mostLikedMusic,
      filteredTotalCommunityMusic,
    };

    res.json({ success: true, musicObject });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

// ========================================== music upload routes ============================================
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
firebase.initializeApp(firebaseConfig);
const uploadMusic = async (req, res) => {
  const _id = req.body.artist;

  // Check if the user has reached the limit of 10 music files
  const user = await AuthenticatedUserModel.findById(_id);
  if (!user) {
    return res.send("User not found");
  }
  if (user.music.length >= 10) {
    return res.status(400).json({
      message:
        "Maximum limit reached. You cannot create more than 10 music files.",
    });
  }

  try {
    if (!req.file) {
      throw new Error("No music file provided");
    }

    // Check if a music file with the same song name already exists
    const existingMusic = await MusicAuthenticatedModel.findOne({
      songname: req.body.songname.toLowerCase(),
    });
    if (existingMusic) {
      return res.status(400).json({
        message:
          "Song name already exists. Please choose a different song name.",
      });
    }

    const genreArray = req.body.genre.split(", ");

    const newMusic = new MusicAuthenticatedModel({
      _id: mongoose.Types.ObjectId(),
      songname: req.body.songname.toLowerCase(),
      artist: _id,
      albumname: req.body.albumname,
      genre: genreArray,
      coverImg: req.body.coverImg,
      format: req.body.format,
      fileSize: req.file.size,
    });

    user.music.push(newMusic._id);
    await user.save();
    await newMusic.save();

    // firebase confs
    const storage = getStorage();
    const storageRef = ref(storage, `musics/${newMusic._id}`);
    const metadata = {
      contentType: "audio/mp3",
    };
    const uploadTask = uploadBytes(storageRef, req.file.buffer, metadata).then(
      () => {
        getDownloadURL(storageRef).then((url) => {
          newMusic.musicUrl = url;
          newMusic.save();
          res.status(201).json({ user, newMusic });
        });
      }
    );
    await uploadTask;
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error uploading music file" });
  }
};

const readAllMusic = async (req, res) => {
  const _id = req.params.id;
  // console.log(req.params.id)

  // _id is the id of user
  // fetch all the songs of this user
  let musics;
  try {
    musics = await MusicAuthenticatedModel.find({ artist: _id }).populate(
      "artist",
      "name"
    );
    if (!musics) {
      res.status(404).json({ message: "No music found" });
    }
    res.status(200).json({ musics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching songs of user" });
  }
};

const readMusic = async (req, res) => {
  const musicId = req.params.id;

  try {
    const music = await MusicAuthenticatedModel.findById(musicId);
    if (!music) {
      res.status(404).json({ message: "Music not found" });
    }

    const conn = mongoose.connection;
    if (!conn || !conn.db) {
      throw new Error("Could not connect to database");
    }

    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "musics",
    });

    const musicFile = bucket.openDownloadStream(music._id);
    musicFile.on("error", (err) => {
      res.status(500).json({ message: "Error downloading music file" });
    });

    // set the response headers to indicate that this is a music file
    res.set("Content-Type", music.format);

    // pipe the music file stream to the response object
    musicFile.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error downloading music file" });
  }
};

const updateMusic = async (req, res) => {
  const musicId = req.params.id;

  try {
    const existingMusic = await MusicAuthenticatedModel.findById(musicId);

    if (!existingMusic) {
      return res.status(404).json({ message: "Music not found" });
    }

    // Update music details if the fields are provided in the request body
    if (req.body.songname) {
      existingMusic.songname = req.body.songname;
    }
    if (req.body.albumname) {
      existingMusic.albumname = req.body.albumname;
    }
    if (req.body.coverImg) {
      existingMusic.coverImg = req.body.coverImg;
    }
    if (req.body.genre) {
      existingMusic.genre = req.body.genre.split(", ");
    }

    if (req.file) {
      // Delete old music file from Firebase
      const storage = getStorage();
      const storageRef = ref(storage, `musics/${musicId}`);
      await deleteObject(storageRef);

      // Upload new music file to Firebase
      const newStorageRef = ref(storage, `musics/${musicId}`);
      const metadata = {
        contentType: "audio/mp3",
      };
      await uploadBytes(newStorageRef, req.file.buffer, metadata);

      // Update music URL
      const url = await getDownloadURL(newStorageRef);
      existingMusic.musicUrl = url;
    }

    await existingMusic.save();

    res
      .status(200)
      .json({ message: "Music updated successfully", music: existingMusic });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating music" });
  }
};

const deleteMusic = async (req, res) => {
  const musicId = req.params.id;
  // console.log("musicId",musicId)

  try {
    // Delete music from MongoDB
    await MusicAuthenticatedModel.findByIdAndDelete(musicId);

    // Delete music file from Firebase
    const storage = getStorage();
    const storageRef = ref(storage, `musics/${musicId}`);

    await deleteObject(storageRef);

    res.status(200).json({ message: "Music deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting music" });
  }
};

const likeMusic = async (req, res) => {
  const { _id, music_id } = req.body;
  // const music_id = req.params.musicid;

  const music = await MusicAuthenticatedModel.findById(music_id);

  try {
    if (!music) {
      res.status(500).json({ success: false, message: "No music found" });
    }

    music.addLikeOrDislike(_id, music_id, true);
    res.json({ success: true, message: "liked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error liking music file" });
  }
};

const dislikeMusic = async (req, res) => {
  const { _id, music_id } = req.body;
  // const music_id = req.params.musicid;

  const music = await MusicAuthenticatedModel.findById(music_id);

  try {
    if (!music) {
      res.status(500).json({ success: false, message: "No music found" });
    }

    music.addLikeOrDislike(_id, music_id, false);
    res.json({ success: true, message: "disliked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error disliking music file" });
  }
};

const viewsMusic = async (req, res) => {
  const { music_id } = req.body;

  try {
    const music = await MusicAuthenticatedModel.findById(music_id);

    if (!music) {
      return res
        .status(500)
        .json({ success: false, message: "No music found" });
    }

    music.views += 1; // Increment the views count
    await music.save();

    res.json({ success: true, message: "Incremented successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error incrementing music" });
  }
};

module.exports = {
  // add friends route/
  addFriend,
  // stats route/
  getStatsData,
  // search engine routes/
  fetchSearches,
  // community routes/
  nearbyFetch,
  likedBased,
  genreBased,
  friendsOfFriends,
  // music routes/
  fetchMLbasedMusic,
  // personal music routes/
  uploadMusic,
  readMusic,
  readAllMusic,
  updateMusic,
  deleteMusic,
  likeMusic,
  dislikeMusic,
  viewsMusic,
};
