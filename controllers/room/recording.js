import { ovApi, ovClient, sessions } from "../../config/openvidu.js";

export const startRecording = async (req, res) => {
  const roomId = req.params.roomId;
  const session = sessions[roomId];

  try {
    const recording = await ovClient.startRecording(session.sessionId);

    res.status(200).json(recording);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const stopRecording = async (req, res) => {
  const roomId = req.params.roomId;
  const recordingId = req.body.id;
  const session = sessions[roomId];

  try {
    const recording = await ovClient.stopRecording(recordingId);

    const newMessage = new Message({
      sender: req.user._id,
      date: new Date(),
      text: `Recording done: ${recording.url}`,
    });

    await Room.findByIdAndUpdate(roomId, { $push: { messages: newMessage } });

    await ovApi.post("signal", {
      session: session.sessionId,
      type: "signal:message",
      data: JSON.stringify(newMessage),
    });

    res.status(200).json(recording);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};
