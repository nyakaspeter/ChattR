import mongoose from "mongoose";
import Message from "./message.js";

const roomSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [Message.schema],
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
