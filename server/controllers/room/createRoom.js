import dotenv from 'dotenv';
import Room from '../../models/room.js';

dotenv.config();

export const createRoom = async (req, res) => {
  const room = { ...req.body, image: req.file?.id, lastActivity: new Date() };
  const userId = req.user._id;

  try {
    const newRoom = new Room(room);
    newRoom.owner = userId;
    newRoom.users = [userId];
    await newRoom.save();

    return res.json(newRoom);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
