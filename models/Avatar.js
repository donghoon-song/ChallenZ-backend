const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MessageTriggerSchema = require("./MessageTrigger");
const AvatarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: true,
  },
  messageTriggerList: [
    {
      type: Schema.Types.ObjectId,
      ref: "MessageTrigger",
    },
  ],
});
module.exports = mongoose.model("Avatar", AvatarSchema);
