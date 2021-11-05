import { OpenViduRole } from 'openvidu-node-client';
import { ovClient, sessions } from '../../config/openvidu.js';

export const getRoomToken = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    if (sessions[roomId]) {
      try {
        await sessions[roomId].fetch();
        if (sessions[roomId].activeConnections.length === 0)
          delete sessions[roomId];
      } catch {
        delete sessions[roomId];
      }
    }

    if (!sessions[roomId]) {
      sessions[roomId] = await ovClient.createSession({
        customSessionId: roomId,
      });
    }

    const connection = await sessions[roomId].createConnection({
      data: req.user._id,
      role: OpenViduRole.PUBLISHER,
    });

    return res.send(connection.token);
  } catch (err) {
    console.error(err);
    return res.status(404).send(err.message);
  }
};
