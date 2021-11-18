import { fetchRoomSession, ovClient } from '../../config/openvidu.js';
import { signalRecordingEnded } from '../../signals/recordingEnded.js';

export const stopRecording = async (req, res) => {
  const roomId = req.params.roomId;
  const user = req.user;

  try {
    const session = await fetchRoomSession(roomId);

    if (!session) {
      throw new Error('The session does not exist');
    }

    if (!session.recordingId) {
      throw new Error('The session is not being recorded');
    }

    const recording = await ovClient.stopRecording(session.recordingId);
    session.recordingId = undefined;
    session.recordingStartedAt = undefined;
    session.recordingUser = undefined;

    await signalRecordingEnded(roomId, recording, user);

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};
