import Room from '../../models/room.js';
import { signalJoinRequestDeclined } from '../../signals/joinRequestDeclined.js';

export const joinRoomDecline = async (req, res) => {
  const roomId = req.params.roomId;
  const joiningUserId = req.params.userId;

  try {
    await Room.findByIdAndUpdate(roomId, {
      $pull: {
        usersWhoRequestedToJoin: joiningUserId,
      },
    });

    await signalJoinRequestDeclined(roomId, joiningUserId);

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
