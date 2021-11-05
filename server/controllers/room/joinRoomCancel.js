import Room from '../../models/room.js';

export const joinRoomCancel = async (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.user._id;

  try {
    await Room.findByIdAndUpdate(roomId, {
      $pull: {
        usersWhoRequestedToJoin: userId,
      },
    });

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
