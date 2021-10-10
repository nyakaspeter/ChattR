import { OpenViduRole } from "openvidu-node-client";
import { ovClient, sessions, tokens } from "../../config/openvidu.js";

export const connectToSession = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    sessions[roomId] = await ovClient.createSession({ customSessionId: roomId });

    const connection = await sessions[roomId].createConnection({
      data: req.user._id,
      role: OpenViduRole.PUBLISHER,
    });

    //tokens[roomId].push(connection.token);

    res.status(200).send({
      token: connection.token,
    });
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};

export const disconnectFromSession = async (req, res) => {
  const roomId = req.params.roomId;
  const token = req.body.token;

  if (sessions[roomId] && tokens[roomId]) {
    const index = tokens[roomId].indexOf(token);

    if (index !== -1) {
      tokens[roomId].splice(index, 1);
    } else {
      res.status(500).send("Invalid token");
    }

    if (tokens.length == 0) {
      delete sessions[roomId];
      delete tokens[roomId];
    }

    res.status(200).send();
  } else {
    res.status(500).send("Invalid session");
  }
};
