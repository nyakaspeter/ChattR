import Room from "../models/room.js";

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createRoom = async (req, res) => {
  const room = req.body;
  const newRoom = new Room(room);

  try {
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
