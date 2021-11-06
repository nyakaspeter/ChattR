import dotenv from 'dotenv';
import Room from '../../models/room.js';
import { signalRoomDeleted } from '../../signals/roomDeleted.js';

dotenv.config();

export const deleteRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    await signalRoomDeleted(roomId);
    await Room.findByIdAndRemove(roomId);

    return res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
