const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommunityChatSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId()
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: "MusicCommunityModel",
  },
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: "AuthenticatedUserModel",
  },
  message: {
    type: String,
    required: true,
  },
});

const CommunityChatModel = mongoose.model("CommunityChat", CommunityChatSchema);

module.exports = CommunityChatModel;
