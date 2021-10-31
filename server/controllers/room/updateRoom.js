import dotenv from 'dotenv';
import { gfs } from '../../config/mongoose.js';
import { ovApi } from '../../config/openvidu.js';
import Room from '../../models/room.js';

dotenv.config();

export const updateRoom = async (req, res) => {
  const deleteImage = req.body.image === 'null';
  const room = { ...req.body, image: deleteImage ? null : req.file?.id };
  const roomId = req.params.roomId;

  try {
    if (deleteImage || req.file) {
      const oldImageId = (await Room.findById(roomId, 'image').lean()).image;

      if (oldImageId) {
        gfs.delete(oldImageId);
      }
    }

    await Room.findByIdAndUpdate(roomId, room, {
      // new: true,
      // select: '-users -messages',
    });

    // await ovApi.post('signal', {
    //   session: roomId,
    //   type: 'signal:roomUpdated',
    //   data: JSON.stringify(room),
    // });

    return res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
