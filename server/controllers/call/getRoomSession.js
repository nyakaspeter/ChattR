import { fetchRoomSession } from '../../config/openvidu.js';

export const getRoomSession = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const session = await fetchRoomSession(roomId);
    const active = !!(session?.connections?.length > 0 && session?.createdAt);

    return res.json({
      active,
      createdAt: active ? new Date(session.createdAt) : undefined,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
