import { Server } from "socket.io";

const socketio = {
  io: undefined,
  init: function (server, sessionMw, passportMw, passportSession) {
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
      },
    });

    io.use(wrap(sessionMw));
    io.use(wrap(passportMw));
    io.use(wrap(passportSession));

    io.use((socket, next) => {
      if (socket.request.user) {
        next();
      } else {
        next(new Error("unauthorized"));
      }
    });

    io.on("connection", (socket) => {
      console.log("User connected to websocket:", socket.request.user._id.toString());

      socket.on("disconnect", () => {
        console.log("User disconnected from websocket:", socket.request.user._id.toString());
      });
    });

    this.io = io;
  },
  filterSocketsByUser: function (filterFn) {
    return Array.from(this.io.sockets.sockets.values()).filter(
      (socket) => socket.handshake && filterFn(socket.conn.request.user)
    );
  },
  emitToUser: function (_id, event, ...args) {
    this.filterSocketsByUser((user) => user._id.equals(_id)).forEach((socket) => socket.emit(event, ...args));
  },
};

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

export default socketio;
