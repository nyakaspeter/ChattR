import { OpenVidu, OpenViduRole } from "openvidu-node-client";
import dotenv from "dotenv";

dotenv.config();

export const OV = new OpenVidu(
  process.env.OPENVIDU_URL,
  process.env.OPENVIDU_SECRET
);

export const sessions = {};
export const sessionTokens = {};
