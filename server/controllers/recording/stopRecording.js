import { ovClient } from '../../config/openvidu.js';
import Message from '../../models/message.js';
import Room from '../../models/room.js';

export const stopRecording = async (req, res) => {
  const roomId = req.params.roomId;
  const recordingId = req.body.id;
  //const session = sessions[roomId];

  try {
    const recording = await ovClient.stopRecording(recordingId);

    const newMessage = new Message({
      sender: req.user._id,
      date: new Date(),
      text: `Recording done: ${recording.url}`,
    });

    await Room.findByIdAndUpdate(roomId, { $push: { messages: newMessage } });

    // TODO: Signal to room that recording has stopped

    res.status(200).json(recording);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};
