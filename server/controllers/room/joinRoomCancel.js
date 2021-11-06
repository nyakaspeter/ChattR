import Room from '../../models/room.js';
import { signalJoinRequestCancelled } from '../../signals/joinRequestCancelled.js';

export const joinRoomCancel = async (req, res) => {
  const userId = req.user._id;
  const roomId = req.params.roomId;

  try {
    await Room.findByIdAndUpdate(roomId, {
      $pull: {
        usersWhoRequestedToJoin: userId,
      },
    });

    await signalJoinRequestCancelled(roomId, userId);

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
