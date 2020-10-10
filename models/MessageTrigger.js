const mongoose = require("mongoose");
const MessageTriggerSchema = new mongoose.Schema({
  // interaction, time, start
  type: {
    type: String,
    required: true,
  },
  // time trigger
  triggerAt: {
    type: Date,
  },
  avatarUrl: {
    type: String,
  },
  // interaction trigger
  trigger: {
    type: String,
  },
  contents: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("MessageTrigger", MessageTriggerSchema);
