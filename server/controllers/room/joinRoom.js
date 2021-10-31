import Room from '../../models/room.js';

export const joinRoom = async (req, res) => {
  const roomId = req.params.roomId;
  const password = req.body.password;

  try {
    const room = await Room.findById(roomId, 'privacy password').lean();

    if (
      room.privacy === 'public' ||
      (room.privacy === 'protected' && room.password === password)
    ) {
      await Room.findByIdAndUpdate(roomId, {
        $addToSet: { users: req.user._id },
        $pull: {
          usersWhoLeft: req.user._id,
          usersWhoRequestedToJoin: req.user._id,
        },
      });

      return res.status(200).end();
    }

    if (room.privacy === 'private') {
      await Room.findByIdAndUpdate(roomId, {
        $addToSet: { usersWhoRequestedToJoin: req.user._id },
      });

      return res.status(200).end();
    }

    return res.status(403).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
