import { ovApi, ovClient } from '../../config/openvidu.js';
import Room from '../../models/room.js';

export const getMessageRecording = async (req, res) => {
  const { roomId, messageId, recordingId } = req.params;

  try {
    const messages = (await Room.findById(roomId, 'messages').lean()).messages;

    const message = messages.find(msg => msg._id.equals(messageId));
    if (!message) {
      return res.status(404).end();
    }

    if (message.recording !== recordingId) {
      return res.status(404).end();
    }

    const recording = await ovClient.getRecording(recordingId);

    ovApi.get(recording.url, { responseType: 'stream' }).then(resp => {
      res.set({
        'Content-Disposition': `attachment; filename=${recording.properties.name}.mp4`,
        'Content-Type': resp.headers['content-type'],
        'Content-Length': resp.headers['content-length'],
      });

      resp.data.pipe(res);
    });
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
};
