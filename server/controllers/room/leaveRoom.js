import Room from '../../models/room.js';
import { signalUserLeft } from '../../signals/userLeft.js';

export const leaveRoom = async (req, res) => {
  const userId = req.user._id;
  const roomId = req.params.roomId;

  try {
    const owner = (await Room.findById(roomId).lean()).owner;

    if (owner.equals(userId)) {
      return res.status(400).end();
    }

    await Room.findByIdAndUpdate(
      roomId,
      {
        $pull: { users: userId },
        $addToSet: { usersWhoLeft: userId },
      },
      { new: true, select: '-messages' }
    )
      .populate({
        path: 'users',
        model: 'User',
        select: 'name picture email',
      })
      .populate({
        path: 'usersWhoLeft',
        model: 'User',
        select: 'name picture',
      });

    await signalUserLeft(roomId, userId);

    return res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
