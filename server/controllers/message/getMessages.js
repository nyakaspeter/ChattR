import Room from '../../models/room.js';

export const getMessages = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const messages = (await Room.findById(roomId, 'messages').lean()).messages;

    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(404).send(err.message);
  }
};
