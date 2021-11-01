import dotenv from 'dotenv';
import Room from '../../models/room.js';

dotenv.config();

export const getRooms = async (req, res) => {
  const userId = req.user._id;

  try {
    const rooms = await Room.find(
      { users: userId },
      { messages: { $slice: -1 } },
      { select: 'name image owner users lastActivity' }
    )
      .populate({ path: 'users', model: 'User', select: 'online' })
      .populate({
        path: 'messages.sender',
        model: 'User',
        select: 'name picture',
      })
      .lean();

    return res.json(
      rooms.map(room => {
        const { users, messages, ...rest } = room;
        return {
          ...rest,
          onlineUserCount: users.filter(u => u.online).length,
          lastMessage: messages[0] || null,
        };
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(404).send(err.message);
  }
};
