import { gfs } from '../../config/mongoose.js';
import Room from '../../models/room.js';
import { signalRoomUpdated } from '../../signals/roomUpdated.js';

export const updateRoom = async (req, res) => {
  const deleteImage = req.body.image === 'null';
  const room = { ...req.body, image: deleteImage ? null : req.file?.id };
  const roomId = req.params.roomId;
  const user = req.user;

  try {
    if (deleteImage || req.file) {
      const oldImageId = (await Room.findById(roomId, 'image').lean()).image;

      if (oldImageId) {
        gfs.delete(oldImageId);
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(roomId, room, {
      new: true,
      select: 'name description image privacy',
    });

    await signalRoomUpdated(roomId, updatedRoom, user);

    return res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};
