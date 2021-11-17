import { fetchRoomSession, ovClient } from '../config/openvidu.js';
import socketio from '../config/socketio.js';
import Room from '../models/room.js';
import { signalCallEnded } from './callEnded.js';

export const signalUserOffline = async userId => {
  const rooms = await Room.find({ users: userId }, '_id').lean();
  const pending = await Room.find(
    { usersWhoRequestedToJoin: userId },
    '_id'
  ).lean();

  [...rooms, ...pending].forEach(room =>
    socketio.emitToRoom(room._id, 'userOffline', { userId }, userId)
  );

  // We go through the user's rooms and if there's an active call we update
  // the session info, because the user may have disconnected unexpectedly
  // and the OpenVidu node client doesn't support user disconnected events
  rooms.forEach(async room => {
    const session = ovClient.activeSessions.find(s =>
      room._id.equals(s.sessionId)
    );

    if (session) {
      const updatedSession = await fetchRoomSession(room._id);
      if (!updatedSession) {
        await signalCallEnded(room._id);
      }
    }
  });
};
