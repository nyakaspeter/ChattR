import dotenv from "dotenv";
import { OpenVidu } from "openvidu-node-client";

dotenv.config();

export const OPENVIDU_URL = process.env.OPENVIDU_URL;
export const OPENVIDU_SECRET = process.env.OPENVIDU_SECRET;

const openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);

export const sessions = {};
export const sessionTokens = {};
export default openvidu;
