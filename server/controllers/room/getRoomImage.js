import dotenv from 'dotenv';
import mongoose, { gfs } from '../../config/mongoose.js';
import Room from '../../models/room.js';

dotenv.config();

export const getRoomImage = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const image = (await Room.findById(roomId, 'image').lean()).image;

    if (!image) {
      return res.status(404).end();
    }

    return gfs.openDownloadStream(image).pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
};
