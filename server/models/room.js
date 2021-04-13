import mongoose from "mongoose";

const roomSchema = mongoose.Schema({
  owner: String,
  name: String,
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
