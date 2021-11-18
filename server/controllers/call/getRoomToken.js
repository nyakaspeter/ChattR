import { OpenViduRole } from 'openvidu-node-client';
import { createRoomSession, fetchRoomSession } from '../../config/openvidu.js';
import { signalCallStarted } from '../../signals/callStarted.js';

export const getRoomToken = async (req, res) => {
  const roomId = req.params.roomId;
  const caller = req.user;

  try {
    let session = await fetchRoomSession(roomId);

    if (!session) {
      session = await createRoomSession(roomId);
      if (session.createdAt) {
        await signalCallStarted(roomId, caller, new Date(session.createdAt));
      }
    }

    const connection = await session.createConnection({
      data: caller._id,
      role: OpenViduRole.PUBLISHER,
    });

    return res.json({
      token: connection.token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
