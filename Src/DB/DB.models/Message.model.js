import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema(
  {
    Contact: {
      type: String,
      required: function () {
        return !this.attachments.length;
      },
    },
    attachments: [String],
    SenderID: { type: mongoose.Types.ObjectId, ref: "User" },
    ReceiverID: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps:true },
);
const MessageModel = mongoose.model("Note", MessageSchema);
export default MessageModel;
