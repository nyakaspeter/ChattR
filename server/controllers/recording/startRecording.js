import { ovClient, sessions } from '../../config/openvidu.js';

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
