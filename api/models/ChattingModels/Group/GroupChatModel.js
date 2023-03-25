const mongoose = require("mongoose");
const { Schema } = mongoose;

const GroupChatSchema = new Schema({
  group: {
    type: Schema.Types.ObjectId,
    ref: "Group",
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

const GroupChatModel = mongoose.model("GroupChat", GroupChatSchema);

module.exports = GroupChatModel;
