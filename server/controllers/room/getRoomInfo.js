import { ovApi } from '../../config/openvidu.js';
import Room from '../../models/room.js';

export const getRoomInfo = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findById(roomId, '-messages')
      .populate({
        path: 'users',
        model: 'User',
        select: 'name picture email online',
      })
      .populate({
        path: 'usersWhoLeft',
        model: 'User',
        select: 'name picture',
      })
      .lean();

    return res.json(room);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
