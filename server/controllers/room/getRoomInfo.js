import Room from '../../models/room.js';

export const getRoomInfo = async (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.user._id;

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
      .populate({
        path: 'usersWhoRequestedToJoin',
        model: 'User',
        select: 'name picture email online',
      })
      .lean();

    // eslint-disable-next-line no-unused-vars
    const { usersWhoRequestedToJoin, ...rest } = room;

    return res.json(room.owner.equals(userId) ? room : { ...rest });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
