import { Server } from 'socket.io';
import Room from '../models/room.js';
import User from '../models/user.js';
import { signalUserOffline } from '../signals/userOffline.js';
import { signalUserOnline } from '../signals/userOnline.js';

const socketio = {
  io: undefined,
  init: function (server, sessionMw, passportMw, passportSession) {
    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:3000',
      },
    });

    io.use(wrap(sessionMw));
    io.use(wrap(passportMw));
    io.use(wrap(passportSession));

    io.use((socket, next) => {
      if (socket.request.user) {
        next();
      } else {
        next(new Error('unauthorized'));
      }
    });

    io.on('connection', async socket => {
      const userId = socket.request.user._id;

      await User.findByIdAndUpdate(userId, { online: true });
      await signalUserOnline(userId);

      socket.on('disconnect', async () => {
        if (!this.isOnline(userId)) {
          await User.findByIdAndUpdate(userId, { online: false });
          await signalUserOffline(userId);
        }
      });
    });

    this.io = io;
  },
  filterSocketsByUser: function (filterFn) {
    return Array.from(this.io.sockets.sockets.values()).filter(
      socket => socket.handshake && filterFn(socket.conn.request.user)
    );
  },
  isOnline: function (userId) {
    return this.filterSocketsByUser(user => user._id.equals(userId)).length > 0;
  },
  emitToUser: function (userId, event, args) {
    this.filterSocketsByUser(user => user._id.equals(userId)).forEach(socket =>
      socket.emit(event, args)
    );
  },
  emitToRoom: async function (roomId, event, args) {
    const room = await Room.findById(roomId, 'users').lean();
    room?.users.forEach(userId =>
      this.emitToUser(userId, event, { roomId, ...args })
    );
  },
};

const wrap = middleware => (socket, next) =>
  middleware(socket.request, {}, next);

export default socketio;
