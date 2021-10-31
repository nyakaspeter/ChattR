import mongoose from '../../config/mongoose.js';
import socketio from '../../config/socketio.js';
import Room from '../../models/room.js';

export const sendMessage = async (req, res) => {
  const roomId = req.params.roomId;
  const message = req.body;
  const files = req.files;

  try {
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      sender: req.user._id,
      date: new Date(),
      text: message.text,
      files: files,
    };

    await Room.findByIdAndUpdate(roomId, {
      lastActivity: newMessage.date,
      $push: { messages: newMessage },
    });

    const { email, ...senderProps } = req.user;

    socketio.emitToRoom(roomId, 'message', {
      roomId,
      sender: { ...senderProps },
      message: newMessage,
    });

    return res.json(newMessage);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
