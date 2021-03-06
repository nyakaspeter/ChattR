import Room from '../../models/room.js';
import { signalJoinRequestAccepted } from '../../signals/joinRequestAccepted.js';
import { signalUserJoined } from '../../signals/userJoined.js';

export const joinRoomAccept = async (req, res) => {
  const roomId = req.params.roomId;
  const joiningUserId = req.params.userId;

  try {
    await Room.findByIdAndUpdate(roomId, {
      $addToSet: { users: joiningUserId },
      $pull: {
        usersWhoLeft: joiningUserId,
        usersWhoRequestedToJoin: joiningUserId,
      },
    });

    await signalJoinRequestAccepted(roomId, joiningUserId);
    await signalUserJoined(roomId, joiningUserId);

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
