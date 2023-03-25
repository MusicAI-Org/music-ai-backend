const { mongoose, Schema, model } = require("mongoose");

const LiveStreamSchema = Schema(
  {
    topic: {
      type: String,
      default: "Live Stream",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthenticatedUserModel",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AuthenticatedUserModel",
      },
    ],
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommentModel",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    url: String,
    roomId: String,
    createdAt: { type: Date, default: Date.now },
    isStreaming: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "livestreams",
  }
);

// Define LiveStream model
const LiveStream = model("LiveStream", LiveStreamSchema);

// Export LiveStream model
module.exports = LiveStream;
