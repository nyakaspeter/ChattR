import { ovApi } from '../../config/openvidu.js';
import Room from '../../models/room.js';
import { deleteRoom } from './deleteRoom.js';

export const leaveRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const owner = (await Room.findById(roomId).lean()).owner;

    if (owner.equals(req.user._id)) {
      return res.status(400).end();
    }

    await Room.findByIdAndUpdate(
      roomId,
      {
        $pull: { users: req.user._id },
        $addToSet: { usersWhoLeft: req.user._id },
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

    // try {
    //   await ovApi.post('signal', {
    //     session: roomId,
    //     type: 'signal:roomUpdated',
    //     data: JSON.stringify(room),
    //   });
    // } catch {
    //   // There is no active session
    // }

    return res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
