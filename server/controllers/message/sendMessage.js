import mongoose from '../../config/mongoose.js';
import Room from '../../models/room.js';
import { signalMessage } from '../../signals/message.js';

export const sendMessage = async (req, res) => {
  const roomId = req.params.roomId;
  const sender = req.user;
  const messageBody = req.body;
  const messageFiles = req.files;

  try {
    const message = {
      _id: new mongoose.Types.ObjectId(),
      type: 'text',
      sender: sender._id,
      date: new Date(),
      text: messageBody.text,
      files: messageFiles.length > 0 ? messageFiles : undefined,
    };

    await Room.findByIdAndUpdate(roomId, {
      lastActivity: message.date,
      $push: { messages: message },
    });

    await signalMessage(roomId, sender, message);

    return res.json(message);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
