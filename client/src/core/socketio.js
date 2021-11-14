import io from 'socket.io-client';
import { queryClient, socketKeys } from './query';
import { handleJoinRequest } from './signals/joinRequest';
import { handleJoinRequestAccepted } from './signals/joinRequestAccepted';
import { handleJoinRequestCancelled } from './signals/joinRequestCancelled';
import { handleJoinRequestDeclined } from './signals/joinRequestDeclined';
import { handleMessage } from './signals/message';
import { handleRecordingStarted } from './signals/recordingStarted';
import { handleRecordingStopped } from './signals/recordingStopped';
import { handleRoomDeleted } from './signals/roomDeleted';
import { handleRoomUpdated } from './signals/roomUpdated';
import { handleSessionUpdated } from './signals/sessionUpdated';
import { handleUserJoined } from './signals/userJoined';
import { handleUserLeft } from './signals/userLeft';
import { handleUserOffline } from './signals/userOffline';
import { handleUserOnline } from './signals/userOnline';

let socket;

export async function wsConnect() {
  if (socket?.connected) {
    return socket;
  }

  socket?.disconnect();
  socket = io.connect('/');

  socket.on('connect', () => {
    console.log('WebSocket connection estabilished');

    // Setup debug logging
    const onevent = socket.onevent;
    socket.onevent = function (packet) {
      var args = packet.data || [];
      onevent.call(this, packet); // Original call
      packet.data = ['*'].concat(args);
      onevent.call(this, packet); // Additional call to catch-all
    };

    socket.on('*', (event, data) => {
      console.log(`MSG ${event}`, data);
    });

    return socket;
  });

  socket.on('disconnect', () => {
    console.error('WebSocket connection lost');
    queryClient.invalidateQueries(socketKeys.current());
  });

  socket.on('joinRequest', handleJoinRequest);
  socket.on('joinRequestAccepted', handleJoinRequestAccepted);
  socket.on('joinRequestCancelled', handleJoinRequestCancelled);
  socket.on('joinRequestDeclined', handleJoinRequestDeclined);
  socket.on('message', handleMessage);
  socket.on('recordingStarted', handleRecordingStarted);
  socket.on('recordingStopped', handleRecordingStopped);
  socket.on('roomDeleted', handleRoomDeleted);
  socket.on('roomUpdated', handleRoomUpdated);
  socket.on('sessionUpdated', handleSessionUpdated);
  socket.on('userJoined', handleUserJoined);
  socket.on('userLeft', handleUserLeft);
  socket.on('userOffline', handleUserOffline);
  socket.on('userOnline', handleUserOnline);
}
