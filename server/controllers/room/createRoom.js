import dotenv from 'dotenv';
import Room from '../../models/room.js';

dotenv.config();

export const createRoom = async (req, res) => {
  const date = new Date();
  const room = { ...req.body, image: req.file?.id, lastActivity: date };
  const userId = req.user._id;

  try {
    const newRoom = new Room(room);
    newRoom.owner = userId;
    newRoom.users = [userId];
    await newRoom.save();

    await Room.findByIdAndUpdate(newRoom._id, {
      $push: {
        messages: {
          type: 'roomCreated',
          sender: userId,
          date,
        },
      },
    });

    return res.json(newRoom);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
