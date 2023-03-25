const mongoose = require("mongoose");
const { Schema } = mongoose;

const OneToOneChatSchema = new Schema({
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: "AuthenticatedUser",
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: "AuthenticatedUser",
  },
  message: {
    type: String,
    required: true,
  },
});

const OneToOneChatModel = mongoose.model("OneToOneChat", OneToOneChatSchema);

module.exports = OneToOneChatModel;
