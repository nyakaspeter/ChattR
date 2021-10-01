import dotenv from "dotenv";
import { OpenVidu } from "openvidu-node-client";

dotenv.config();

export const OV = new OpenVidu(process.env.OPENVIDU_URL, process.env.OPENVIDU_SECRET);

export const sessions = {};
export const sessionTokens = {};
