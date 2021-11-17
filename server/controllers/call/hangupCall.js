import { fetchRoomSession } from '../../config/openvidu.js';
import { signalCallEnded } from '../../signals/callEnded.js';

export const hangupCall = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const session = await fetchRoomSession(roomId);

    if (!session) {
      await signalCallEnded(roomId);
    }

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
