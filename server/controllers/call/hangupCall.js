import { fetchRoomSession } from '../../config/openvidu.js';
import { signalSessionUpdated } from '../../signals/sessionUpdated.js';

export const hangupCall = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const session = await fetchRoomSession(roomId);

    if (!session) {
      await signalSessionUpdated(roomId, { active: false });
    }

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
