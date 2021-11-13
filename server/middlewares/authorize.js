import Room from '../models/room.js';

export const authorize = level => async (req, res, next) => {
  const { roomId, messageId } = req.params;
  const userId = req.user._id;

  try {
    if (level === 'roomUser') {
      const room = await Room.findById(roomId, 'users').lean();
      const user = room.users.find(id => id.equals(userId));

      if (user) {
        return next();
      }
    }

    if (level === 'roomOwner') {
      const room = await Room.findById(roomId, 'owner').lean();

      if (room.owner.equals(userId)) {
        return next();
      }
    }

    if (level === 'messageSender') {
      const room = await Room.findById(roomId, 'users messages').lean();
      const user = room.users.find(id => id.equals(userId));

      if (user) {
        const message = room.messages.find(msg => msg._id.equals(messageId));

        if (message.sender.equals(userId)) {
          return next();
        }
      }
    }

    const room = await Room.findById(
      roomId,
      'name description image privacy users usersWhoRequestedToJoin'
    )
      .populate({ path: 'users', model: 'User', select: 'online' })
      .lean();

    const requested = room.usersWhoRequestedToJoin.find(id =>
      id.equals(userId)
    );

    return res.status(403).json({
      room: {
        _id: room._id,
        name: room.name,
        description: room.description,
        privacy: room.privacy,
        userCount: room.users.length,
        onlineUserCount: room.users.filter(u => u.online).length,
        image: room.image,
        status: requested ? 'requestedToJoin' : 'notMember',
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
};
