import { OpenViduRole } from "openvidu-node-client";
import { ovApi, ovClient, sessions } from "../../config/openvidu.js";
import Room from "../../models/room.js";
import { deleteRoom } from "./crud.js";

export const getSessionToken = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).end();

    if (sessions[roomId]) {
      try {
        await sessions[roomId].fetch();
        if (sessions[roomId].activeConnections.length === 0) delete sessions[roomId];
      } catch {
        delete sessions[roomId];
      }
    }

    if (!sessions[roomId]) {
      sessions[roomId] = await ovClient.createSession({ customSessionId: roomId });
    }

    const connection = await sessions[roomId].createConnection({
      data: req.user._id,
      role: OpenViduRole.PUBLISHER,
    });

    res.status(200).send(connection.token);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

export const enterRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { users: req.user._id }, $pull: { usersWhoLeft: req.user._id } },
      { new: true, select: "-messages" }
    )
      .populate({
        path: "users",
        model: "User",
        select: "name picture email",
      })
      .populate({
        path: "usersWhoLeft",
        model: "User",
        select: "name picture",
      });

    try {
      await ovApi.post("signal", {
        session: roomId,
        type: "signal:roomUpdated",
        data: JSON.stringify(room),
      });
    } catch {
      // There is no active session
    }

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    let room = await Room.findById(roomId);
    if (room.owner.equals(req.user._id)) return deleteRoom(req, res);

    room = await Room.findByIdAndUpdate(
      roomId,
      { $pull: { users: req.user._id }, $addToSet: { usersWhoLeft: req.user._id } },
      { new: true, select: "-messages" }
    )
      .populate({
        path: "users",
        model: "User",
        select: "name picture email",
      })
      .populate({
        path: "usersWhoLeft",
        model: "User",
        select: "name picture",
      });

    try {
      await ovApi.post("signal", {
        session: roomId,
        type: "signal:roomUpdated",
        data: JSON.stringify(room),
      });
    } catch {
      // There is no active session
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};
