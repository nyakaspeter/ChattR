import dotenv from 'dotenv';
import Room from '../../models/room.js';

dotenv.config();

export const getRooms = async (req, res) => {
  const userId = req.user._id;

  try {
    const rooms = await Room.find(
      { users: userId },
      { messages: { $slice: -1 } },
      { select: 'name image owner lastActivity' }
    )
      .populate({
        path: 'messages.sender',
        model: 'User',
        select: 'name picture',
      })
      .lean();

    return res.json(
      rooms.map(room => {
        const { messages, ...rest } = room;
        return { ...rest, lastMessage: messages[0] || null };
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(404).send(err.message);
  }
};
