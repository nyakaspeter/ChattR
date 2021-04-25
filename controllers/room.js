import Room from "../models/room.js";
import Message from "../models/message.js";

export const getRooms = async (req, res) => {
  const userId = req.user._id;

  try {
    const rooms = await Room.find({ users: userId });
    res.json(rooms);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const createRoom = async (req, res) => {
  const room = req.body;
  const userId = req.user._id;

  try {
    const newRoom = new Room(room);
    newRoom.owner = userId;
    newRoom.users = [userId];
    await newRoom.save();

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const editRoom = async (req, res) => {
  const editedRoom = req.body;
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { name: editedRoom.name },
      { new: true }
    ).populate({ path: "messages.sender", model: "User" });

    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    await Room.findByIdAndRemove(roomId);

    res.end();
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err.message });
  }
};

export const joinRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { users: req.user._id } },
      { new: true }
    ).populate({ path: "messages.sender", model: "User" });

    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findById(roomId);

    if (room.owner.equals(req.user._id))
      throw new Error("It's not possible to leave your own room");

    await Room.findByIdAndUpdate(roomId, { $pull: { users: req.user._id } });

    res.end();
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  const roomId = req.params.roomId;
  const message = req.body;
  const files = req.files;

  try {
    const newMessage = new Message({
      sender: req.user._id,
      date: new Date(),
      text: message.text,
      files: files,
    });

    await Room.findByIdAndUpdate(roomId, { $push: { messages: newMessage } });

    await newMessage.execPopulate({ path: "sender", model: "User" });

    res.status(201).json(newMessage);
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err.message });
  }
};
