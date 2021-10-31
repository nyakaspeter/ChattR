import { gfs } from '../../config/mongoose.js';
import Room from '../../models/room.js';

export const getMessageFile = async (req, res) => {
  const { roomId, messageId, fileId } = req.params;

  try {
    const messages = (await Room.findById(roomId, 'messages').lean()).messages;

    const message = messages.find(msg => msg._id.equals(messageId));
    if (!message) {
      return res.status(404).end();
    }

    const file = message.files.find(file => file.id.equals(fileId));
    if (!file) {
      return res.status(404).end();
    }

    res.set({
      'Content-Disposition': `attachment; filename=${file.filename}`,
      'Content-Type': file.contentType,
    });

    return gfs.openDownloadStream(file.id).pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
};
