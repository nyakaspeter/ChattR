import Room from '../../models/room.js';

export const joinRoomDecline = async (req, res) => {
  const roomId = req.params.roomId;
  const joiningUserId = req.params.userId;

  try {
    await Room.findByIdAndUpdate(roomId, {
      $pull: {
        usersWhoRequestedToJoin: joiningUserId,
      },
    });

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
