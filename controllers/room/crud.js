import dotenv from "dotenv";
import Room from "../../models/room.js";

dotenv.config();

export const getRooms = async (req, res) => {
  const userId = req.user._id;

  try {
    const rooms = await Room.find({ users: userId }, "-users -messages");
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

export const updateRoom = async (req, res) => {
  const editedRoom = req.body;
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByIdAndUpdate(roomId, { name: editedRoom.name }, { new: true }).populate({
      path: "messages.sender",
      model: "User",
    });

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    await Room.findByIdAndRemove(roomId);

    res.end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const enterRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { users: req.user._id } },
      { new: true, select: "-messages" }
    )
      .populate({
        path: "users",
        model: "User",
        select: "name picture email",
      })
      .populate({
        path: "usersWhoLeft",
        model: "User",
        select: "name picture",
      });

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findById(roomId);

    if (room.owner.equals(req.user._id)) throw new Error("It's not possible to leave your own room");

    await Room.findByIdAndUpdate(roomId, { $pull: { users: req.user._id } });

    res.end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};
