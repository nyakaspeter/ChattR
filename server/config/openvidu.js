import axios from 'axios';
import dotenv from 'dotenv';
import { OpenVidu } from 'openvidu-node-client';
import { signalSessionUpdated } from '../signals/sessionUpdated.js';

dotenv.config();

const OPENVIDU_URL = process.env.OPENVIDU_URL;
const OPENVIDU_SECRET = process.env.OPENVIDU_SECRET;

export const ovClient = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);

export const ovApi = axios.create({
  baseURL: `${OPENVIDU_URL}/openvidu/api`,
  headers: {
    Authorization: `Basic ${Buffer.from(
      `OPENVIDUAPP:${OPENVIDU_SECRET}`
    ).toString('base64')}`,
    'Content-Type': 'application/json',
  },
});

export const fetchRoomSession = async roomId => {
  await ovClient.fetch();
  return ovClient.activeSessions.find(s => s.sessionId === roomId);
};

export const createRoomSession = async roomId => {
  const session = await ovClient.createSession({ customSessionId: roomId });
  await signalSessionUpdated(roomId, {
    active: true,
    createdAt: new Date(session.createdAt),
  });
  return session;
};
