import { fetchRoomSession } from '../../config/openvidu.js';

export const getRoomSession = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const session = await fetchRoomSession(roomId);

    if (session) {
      return res.json({
        active: true,
        createdAt: new Date(session.createdAt),
        recording: session.recording,
        recordingStartedAt: session.recordingStartedAt,
      });
    }

    return res.json({ active: false });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
