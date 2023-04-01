const express = require("express");
const AuthenticatedUserModel = require("../models/User/Auth/AuthenticatedUser.model");
const MusicAuthenticatedModel = require("../models/Music/Auth/MusicAuthenticated.model");
const CommentModel = require("../models/Comment/Comment.model");
const OneToOneChatModel = require("../models/ChattingModels/OneToOneChatModel");
const GroupModel = require("../models/Community/Community.model");
const GroupChatModel = require("../models/Community/CommunityChat.model");
const { default: mongoose } = require("mongoose");
// const redis = require("redis");
// const { promisify } = require("util");

// const redisClient = redis.createClient();

// const lpushAsync = promisify(redisClient.lPush).bind(redisClient);
// const lrangeAsync = promisify(redisClient.lRange).bind(redisClient);
// const expireAsync = promisify(redisClient.expire).bind(redisClient);

module.exports = function (io) {
  console.log("Sockets connected");
  const router = express.Router();

  // ************************************************ add comment to the music video that are uploaded ************************************************ //
  async function addComment(musicId, userId, comment, io) {
    const music = await MusicAuthenticatedModel.findById(musicId);
    const user = await AuthenticatedUserModel.findById(userId);

    if (!music || !user) {
      return;
    }

    const newComment = new CommentModel({
      _id: new mongoose.Types.ObjectId(),
      user: userId,
      music: musicId,
      comment,
    });

    await newComment.save();

    music.comments.push(newComment._id);
    await music.save();

    io.emit(`comment:${musicId}`, newComment.toJSON());

    // Store the comment in the user's Redis list
    // await lpushAsync(`user:${userId}:messages`, JSON.stringify(newComment));
    // await expireAsync(`user:${userId}:messages`, 86400); // Set expiration time to 24 hours
  }

  // ************************************************ add one to one chat feature  ************************************************ //
  async function addOneToOneChat(fromUser, toUser, message, io) {
    const fromAuthenticatedUser = await AuthenticatedUserModel.findById(
      fromUser
    );
    const toAuthenticatedUser = await AuthenticatedUserModel.findById(toUser);

    if (!fromAuthenticatedUser || !toAuthenticatedUser) {
      return;
    }

    const newOneToOneChat = new OneToOneChatModel({
      _id: new mongoose.Types.ObjectId(),
      fromUser,
      toUser,
      message,
    });

    await newOneToOneChat.save();

    // Store the message in Redis for both sender and receiver
    // const messageString = JSON.stringify(newOneToOneChat);
    // await lpushAsync(`user:${fromUser}:messages:${toUser}`, messageString);
    // await lpushAsync(`user:${toUser}:messages:${fromUser}`, messageString);

    // // Set expiration time to 24 hours
    // await expireAsync(`user:${fromUser}:messages:${toUser}`, 86400);
    // await expireAsync(`user:${toUser}:messages:${fromUser}`, 86400);

    // // Retrieve messages from Redis cache
    // const fromUserMessages = await lrangeAsync(
    //   `user:${fromUser}:messages:${toUser}`,
    //   0,
    //   -1
    // );
    // const toUserMessages = await lrangeAsync(
    //   `user:${toUser}:messages:${fromUser}`,
    //   0,
    //   -1
    // );

    io.emit(`oneToOneChat:${fromUser}:${toUser}`, {
      newOneToOneChat: newOneToOneChat.toJSON(),
      fromUserMessages,
      toUserMessages,
    });
  }

  // ************************************************ add one to many group feature function ************************************************ //
  async function addGroupChat(groupName, fromUser, message, io) {
    const authenticatedUser = await AuthenticatedUserModel.findById(fromUser);
    if (!authenticatedUser) {
      return;
    }

    // Find the group by name
    const group = await GroupModel.findOne({ name: groupName }).populate(
      "members"
    );

    if (!group) {
      return;
    }

    // Check if the user is a member of the group
    const isMember = group.members.some(
      (user) => user._id.toString() === fromUser
    );
    if (!isMember) {
      return;
    }

    const newGroupChat = new GroupChatModel({
      _id: new mongoose.Types.ObjectId(),
      group: group._id,
      fromUser,
      message,
    });

    await newGroupChat.save();

    io.emit(`groupChat:${group._id}`, newGroupChat.toJSON());

    // Store the message in Redis for each user in the group
    // const userIds = await lrangeAsync(`group:${groupName}:users`, 0, -1);
    // const messageString = JSON.stringify(newGroupChat);
    // await Promise.all(
    //   userIds.map(async (userId) => {
    //     await lpushAsync(`user:${userId}:messages`, messageString);
    //     await expireAsync(`user:${userId}:messages`, 86400); // Set expiration time to 24 hours
    //   })
    // );
  }

  // socket io events
  io.on("connection", async function (socket) {
    console.log("a user connected");

    // **************************************************** web - sockets **************************************************** //
    // add comment socket //
    socket.on("addComment", async function (data) {
      console.log("addComment", data);
      const { musicId, userId, comment } = data;
      await addComment(musicId, userId, comment, io);
    });

    // one to one chatting socket //
    socket.on("addOneToOneChat", async function (data) {
      console.log("addOneToOneChat", data);
      const { fromUser, toUser, message } = data;
      await addOneToOneChat(fromUser, toUser, message, io);
    });

    // group chatting socket
    socket.on("addGroupChat", async function (data) {
      console.log("addGroupChat", data);
      const { groupName, fromUser, message } = data;
      await addGroupChat(groupName, fromUser, message, io);
    });
  });

  return router;
};
