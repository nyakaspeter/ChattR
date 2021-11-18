import { Recording, RecordingLayout } from 'openvidu-node-client';
import { fetchRoomSession, ovClient } from '../../config/openvidu.js';
import { signalRecordingStarted } from '../../signals/recordingStarted.js';

export const startRecording = async (req, res) => {
  const roomId = req.params.roomId;
  const user = req.user;

  try {
    const session = await fetchRoomSession(roomId);

    if (!session) {
      throw new Error('The session does not exist');
    }

    if (session.recording) {
      throw new Error('The session is already being recorded');
    }

    const recording = await ovClient.startRecording(session.sessionId, {
      outputMode: Recording.OutputMode.COMPOSED,
      recordingLayout: RecordingLayout.CUSTOM,
    });
    session.recordingId = recording.id;
    session.recordingStartedAt = new Date(recording.createdAt);
    session.recordingUser = user;

    await signalRecordingStarted(roomId, recording, user);

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};
