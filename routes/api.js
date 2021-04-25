import express from "express";

import {
  getRooms,
  createRoom,
  editRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  sendMessage,
} from "../controllers/room.js";
import { getFile } from "../controllers/file.js";
import { getUser } from "../controllers/user.js";
import { upload } from "../config/mongoose.js";

const router = express.Router();

router.get("/room", getRooms);
router.post("/room", createRoom);
router.put("/room/:roomId", editRoom);
router.delete("/room/:roomId", deleteRoom);
router.get("/room/:roomId/join", joinRoom);
router.get("/room/:roomId/leave", leaveRoom);
router.post("/room/:roomId/message", upload.array("files"), sendMessage);

router.get("/file/:fileId", getFile);

router.get("/user", getUser);

export default router;
