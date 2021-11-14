import Room from '../../models/room.js';
import { signalJoinRequest } from '../../signals/joinRequest.js';
import { signalUserJoined } from '../../signals/userJoined.js';

export const joinRoom = async (req, res) => {
  const userId = req.user._id;
  const roomId = req.params.roomId;
  const password = req.body.password;

  try {
    const room = await Room.findById(roomId, 'privacy password').lean();

    if (
      room.privacy === 'public' ||
      (room.privacy === 'protected' && room.password === password)
    ) {
      await Room.findByIdAndUpdate(roomId, {
        $addToSet: { users: userId },
        $pull: {
          usersWhoLeft: userId,
          usersWhoRequestedToJoin: userId,
        },
      });

      await signalUserJoined(roomId, userId);

      return res.status(200).end();
    }

    if (room.privacy === 'private') {
      await Room.findByIdAndUpdate(roomId, {
        $addToSet: { usersWhoRequestedToJoin: userId },
      });

      await signalJoinRequest(roomId, userId);

      return res.status(200).end();
    }

    return res.status(403).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
