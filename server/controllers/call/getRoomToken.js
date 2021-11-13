import { OpenViduRole } from 'openvidu-node-client';
import { createRoomSession, fetchRoomSession } from '../../config/openvidu.js';

export const getRoomToken = async (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.user._id;

  try {
    const session =
      (await fetchRoomSession(roomId)) || (await createRoomSession(roomId));

    const connection = await session.createConnection({
      data: userId,
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
