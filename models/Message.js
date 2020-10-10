const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema(
  {
    // 있으면 bot, 없으면 user
    avatarUrl: {
      type: String,
    },
    contents: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at" },
  }
);
module.exports = mongoose.model("Message", MessageSchema);
