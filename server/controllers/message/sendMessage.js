import mongoose from '../../config/mongoose.js';
import Room from '../../models/room.js';
import { signalMessage } from '../../signals/message.js';

export const sendMessage = async (req, res) => {
  const roomId = req.params.roomId;
  const sender = req.user;
  const message = req.body;
  const files = req.files;

  try {
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      sender: sender._id,
      date: new Date(),
      text: message.text,
      files: files,
    };

    await Room.findByIdAndUpdate(roomId, {
      lastActivity: newMessage.date,
      $push: { messages: newMessage },
    });

    await signalMessage(roomId, sender, newMessage);

    return res.json(newMessage);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
