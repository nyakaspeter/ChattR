import axios from 'axios';
import dotenv from 'dotenv';
import { OpenVidu } from 'openvidu-node-client';

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
  try {
    const session = ovClient.activeSessions.find(
      s => s.sessionId === roomId.toString()
    );
    await session.fetch();
    if (session?.connections?.length === 0 || !session?.createdAt) {
      return undefined;
    }
    return session;
  } catch {
    return undefined;
  }
};

export const createRoomSession = async roomId => {
  return await ovClient.createSession({ customSessionId: roomId });
};
