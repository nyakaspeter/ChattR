import axios from "axios";
import dotenv from "dotenv";
import { OpenViduRole } from "openvidu-node-client";
import openvidu, { OPENVIDU_SECRET, OPENVIDU_URL, sessions, sessionTokens } from "../config/openvidu.js";
import Message from "../models/message.js";
import Room from "../models/room.js";

dotenv.config();

export const getRooms = async (req, res) => {
  const userId = req.user._id;

  try {
    const rooms = await Room.find({ users: userId });
    res.json(rooms);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const createRoom = async (req, res) => {
  const room = req.body;
  const userId = req.user._id;

  try {
    const newRoom = new Room(room);
    newRoom.owner = userId;
    newRoom.users = [userId];
    await newRoom.save();

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const editRoom = async (req, res) => {
  const editedRoom = req.body;
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByIdAndUpdate(roomId, { name: editedRoom.name }, { new: true }).populate({
      path: "messages.sender",
      model: "User",
    });

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    await Room.findByIdAndRemove(roomId);

    res.end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const joinRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByIdAndUpdate(roomId, { $addToSet: { users: req.user._id } }, { new: true }).populate({
      path: "messages.sender",
      model: "User",
    });

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findById(roomId);

    if (room.owner.equals(req.user._id)) throw new Error("It's not possible to leave your own room");

    await Room.findByIdAndUpdate(roomId, { $pull: { users: req.user._id } });

    res.end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  const roomId = req.params.roomId;
  const message = req.body;
  const files = req.files;
  const session = sessions[roomId];

  try {
    const newMessage = new Message({
      sender: req.user._id,
      date: new Date(),
      text: message.text,
      files: files,
    });

    await Room.findByIdAndUpdate(roomId, { $push: { messages: newMessage } });

    await newMessage.populate({ path: "sender", model: "User" });

    await axios.post(
      `${OPENVIDU_URL}/openvidu/api/signal`,
      {
        session: session.sessionId,
        type: "signal:message",
        data: JSON.stringify(newMessage),
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`OPENVIDUAPP:${OPENVIDU_SECRET}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(201).end();
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const startRecording = async (req, res) => {
  const roomId = req.params.roomId;
  const session = sessions[roomId];

  try {
    const recording = await openvidu.startRecording(session.sessionId);

    res.status(200).json(recording);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const stopRecording = async (req, res) => {
  const roomId = req.params.roomId;
  const recordingId = req.body.id;
  const session = sessions[roomId];

  try {
    const recording = await openvidu.stopRecording(recordingId);

    const newMessage = new Message({
      sender: req.user._id,
      date: new Date(),
      text: `Recording done: ${recording.url}`,
    });

    await Room.findByIdAndUpdate(roomId, { $push: { messages: newMessage } });

    await newMessage.execPopulate({ path: "sender", model: "User" });

    await axios.post(
      `${OPENVIDU_URL}/openvidu/api/signal`,
      {
        session: session.sessionId,
        type: "signal:message",
        data: JSON.stringify(newMessage),
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`OPENVIDUAPP:${OPENVIDU_SECRET}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(recording);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const connectRoom = async (req, res) => {
  const roomId = req.params.roomId;

  const connectionProperties = {
    data: req.user._id,
    role: OpenViduRole.PUBLISHER,
  };

  if (sessions[roomId]) {
    const session = sessions[roomId];

    session
      .createConnection(connectionProperties)
      .then((connection) => {
        sessionTokens[roomId].push(connection.token);

        res.status(200).send({
          token: connection.token,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(409).json({ message: err.message });
      });
  } else {
    openvidu
      .createSession()
      .then((session) => {
        sessions[roomId] = session;
        sessionTokens[roomId] = [];

        session
          .createConnection(connectionProperties)
          .then((connection) => {
            sessionTokens[roomId].push(connection.token);

            res.status(200).send({
              token: connection.token,
            });
          })
          .catch((err) => {
            console.error(err);
            res.status(409).json({ message: err.message });
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(409).json({ message: err.message });
      });
  }
};

export const disconnectRoom = async (req, res) => {
  const roomId = req.params.roomId;
  const token = req.body.token;

  if (sessions[roomId] && sessionTokens[roomId]) {
    const tokens = sessionTokens[roomId];
    const index = tokens.indexOf(token);

    if (index !== -1) {
      tokens.splice(index, 1);
    } else {
      var msg = "Problems in the app server: the TOKEN wasn't valid";
      console.error(msg);
      res.status(500).send(msg);
    }

    if (tokens.length == 0) {
      delete sessions[roomId];
    }

    res.status(200).send();
  } else {
    var msg = "Problems in the app server: the SESSION does not exist";
    console.error(msg);
    res.status(500).send(msg);
  }
};
