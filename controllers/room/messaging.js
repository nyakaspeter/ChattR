import { ovApi, sessions } from "../../config/openvidu.js";
import Room from "../../models/room.js";

export const getMessages = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findById(roomId);

    res.json(room.messages);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  const roomId = req.params.roomId;
  const message = req.body;
  const files = req.files;
  const session = sessions[roomId];

  try {
    const newMessage = {
      sender: req.user._id,
      date: new Date(),
      text: message.text,
      files: files,
    };

    await Room.findByIdAndUpdate(roomId, { $push: { messages: newMessage } });

    await ovApi.post("signal", {
      session: session.sessionId,
      type: "signal:message",
      data: JSON.stringify(newMessage),
    });

    res.status(201).end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};
