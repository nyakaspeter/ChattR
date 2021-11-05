import Room from '../../models/room.js';

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

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
