const MessageTriggerSchema = require("./MessageTrigger");
const AvatarSchema = require("./Avatar");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: "Avatar",
    },
    messageList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
module.exports = mongoose.model("Challenge", ChallengeSchema);
