import mongoose from "../../config/mongoose.js";
import socketio from "../../config/socketio.js";
import Room from "../../models/room.js";

export const getMessages = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findById(roomId);

    res.json(room.messages);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

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

    const room = await Room.findByIdAndUpdate(roomId, { $push: { messages: newMessage } });

    const { email, ...senderProps } = req.user;

    room.users.forEach((u) => {
      socketio.emitToUser(u._id, "message", {
        roomId,
        sender: { ...senderProps },
        message: newMessage,
      });
    });

    res.status(201).end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};
