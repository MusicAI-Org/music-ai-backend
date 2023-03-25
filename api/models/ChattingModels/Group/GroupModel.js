const mongoose = require("mongoose");
const { Schema } = mongoose;

// Group model
const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "AuthenticatedUserModel",
    },
  ],
});

const GroupModel = mongoose.model("Group", GroupSchema);

module.exports = GroupModel;
