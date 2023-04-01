const express = require("express");
const LiveStream = require("../models/LiveStream/LiveStream.model");
const redis = require("redis");
const redisClient = redis.createClient();

module.exports = function (io) {
  console.log("Web-RTC connected");
  const router = express.Router();

  // socket io events
  io.on("connection", async function (socket) {
    console.log("a user connected");

    // **************************************************** web - RTC **************************************************** //
    // ************************************** start and stop handlers  ************************************* //
    // Start LiveStream
    const startStream = async (roomId) => {
      const liveStream = await LiveStream.findOne({ roomId });
      if (liveStream) {
        // Set LiveStream as active
        await LiveStream.updateOne({ roomId }, { $set: { isStreaming: true } });
      } else {
        io.to(roomId).emit("livestreamError", "LiveStream not found");
      }
    };

    // Stop LiveStream
    const stopStream = async (roomId) => {
      const liveStream = await LiveStream.findOne({ roomId });
      if (liveStream) {
        // Set LiveStream as inactive
        await LiveStream.updateOne(
          { roomId },
          { $set: { isStreaming: false, endTime: Date.now() } }
        );
        // Notify other users that the stream has stopped
        io.to(roomId).emit("streamStopped");
      } else {
        io.to(roomId).emit("livestreamError", "LiveStream not found");
      }
    };

    // ************************************** socket handlers  ************************************* //
    // Handle starting a new live stream
    socket.on("startStream", async (topic, id) => {
      // Check if the user is already streaming, means the endtime should be null
      const userStream = await LiveStream.findOne({
        creator: id,
        endTime: null,
      });
      if (userStream) {
        io.to(socket.id).emit("livestreamError", "User is already streaming");
        return;
      }

      // Generate unique room ID
      const roomId = uuidv4();

      // Generate unique stream URL
      const url = `http://localhost:3000/livestream/${roomId}`;

      // Create new LiveStream entry
      const newLiveStream = new LiveStream({
        topic: topic,
        url,
        viewers: [],
        roomId,
        creator: id,
        startTime: Date.now(),
        endTime: null,
        description: "",
        chats: [],
      });

      await newLiveStream.save();

      // Set LiveStream as active
      await startStream(roomId);

      // Join LiveStream room
      socket.join(roomId);

      // Send LiveStream data to client
      io.to(socket.id).emit("livestreamData", newLiveStream);

      // Cache LiveStream data in Redis for future requests
      redisClient.set(`livestream:${roomId}`, JSON.stringify(newLiveStream));
    });

    // Handle stopping the live stream => event handled by the initiator of the stream
    socket.on("stopStream", async (id) => {
      // Check if user is streaming
      const stream = await LiveStream.findOne({
        creator: id,
        endTime: null,
      });
      if (!stream) {
        io.to(socket.id).emit("livestreamError", "User is not streaming");
        return;
      }

      // Stop the LiveStream
      await stopStream(stream.roomId);

      // Remove LiveStream data from Redis cache
      redisClient.del(`livestream:${stream.roomId}`);

      // Leave LiveStream room
      socket.leave(stream.roomId);
    });

    // Handle joining LiveStream room
    socket.on("joinLiveStream", async (roomId) => {
      // Check Redis cache for LiveStream data
      const liveStream = await redisClient.getAsync(`livestream:${roomId}`);
      if (liveStream) {
        // Use cached LiveStream data
        io.to(socket.id).emit("livestreamData", JSON.parse(liveStream));

        // Join the room
        socket.join(roomId);
      } else {
        // Look up LiveStream data in database
        const dbLiveStream = await LiveStream.findOne({ roomId });
        if (dbLiveStream) {
          // Use LiveStream data from database
          io.to(socket.id).emit("livestreamData", dbLiveStream);

          // Join the room
          socket.join(roomId);

          // Cache LiveStream data in Redis for future requests
          redisClient.set(`livestream:${roomId}`, JSON.stringify(dbLiveStream));
        } else {
          // LiveStream does not exist
          io.to(socket.id).emit("livestreamError", "LiveStream not found");
        }
      }

      // Increment viewer count
      await LiveStream.findOneAndUpdate(
        { roomId },
        { $push: { viewers: userId } },
        { new: true }
      );

      // Handle disconnection from LiveStream room
      // Handle user leaving the LiveStream => event handled by any user watching the live stream
      socket.on("disconnect", async (userId) => {
        // Check if user is authorized to leave the stream
        const stream = await LiveStream.findOne({
          roomId: roomId,
        });
        if (stream) {
          // Leave LiveStream room
          socket.leave(roomId);

          // Notify other users that the user has left
          socket.to(roomId).emit("userLeft", userId);

          // Remove user from the list of viewers in the LiveStream model
          await LiveStream.findOneAndUpdate(
            { roomId },
            { $pull: { viewers: userId } },
            { new: true }
          );

          // Remove user from Redis cache
          const redisKey = `livestream:${roomId}:viewers`;
          redisClient.sRem(redisKey, userId.toString());
        } else {
          io.to(socket.id).emit(
            "livestreamError",
            "Unauthorized to leave the stream"
          );
        }
      });

      // Handle WebRTC offer signal
      socket.on("offer", (offer, roomId, sender) => {
        socket.to(roomId).broadcast.emit("offer", offer, sender);
      });

      // Handle WebRTC answer signal
      socket.on("answer", (answer, roomId, sender) => {
        socket.to(roomId).broadcast.emit("answer", answer, sender);
      });

      // Handle ICE candidates
      // When a WebRTC connection is established, the two devices need to exchange network information to find the best way to
      // communicate directly with each other. This involves gathering ICE candidates, which are a list of potential network addresses
      // that can be used to connect to the other device. The ICE framework uses these candidates to determine the optimal path for
      // real-time media to be transmitted between the two devices.
      // Each device generates its own list of ICE candidates, which includes all of the IP addresses and ports it can use to communicate
      // over the internet, as well as other network-related information. Once both devices have generated their lists, they begin
      // exchanging them with each other until they find a mutual candidate that can be used for communication. This process is called ICE
      // negotiation.
      socket.on("iceCandidate", (candidate, roomId, sender) => {
        socket.to(roomId).broadcast.emit("iceCandidate", candidate, sender);
      });
    });
  });

  return router;
};
