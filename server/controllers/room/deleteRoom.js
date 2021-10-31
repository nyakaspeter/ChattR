import dotenv from 'dotenv';
import { ovApi, sessions } from '../../config/openvidu.js';
import Room from '../../models/room.js';

dotenv.config();

export const deleteRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    // await ovApi.post('signal', {
    //   session: roomId,
    //   type: 'signal:roomDeleted',
    // });

    // if (sessions[roomId]) await sessions[roomId].close();

    await Room.findByIdAndRemove(roomId);

    return res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
