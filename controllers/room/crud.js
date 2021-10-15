import dotenv from "dotenv";
import { ovApi, sessions } from "../../config/openvidu.js";
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
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByIdAndUpdate(roomId, req.body, { new: true, select: "-users -messages" });

    await ovApi.post("signal", {
      session: roomId,
      type: "signal:roomUpdated",
      data: JSON.stringify(room),
    });

    res.end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    await ovApi.post("signal", {
      session: roomId,
      type: "signal:roomDeleted",
    });

    if (sessions[roomId]) await sessions[roomId].close();

    await Room.findByIdAndRemove(roomId);

    res.end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};
