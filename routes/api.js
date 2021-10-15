import express from "express";
import { upload } from "../config/mongoose.js";
import { getFile } from "../controllers/file.js";
import { enterRoom, getSessionToken, leaveRoom } from "../controllers/room/connection.js";
import { createRoom, deleteRoom, getRooms, updateRoom } from "../controllers/room/crud.js";
import { getMessages, sendMessage } from "../controllers/room/messaging.js";
import { startRecording, stopRecording } from "../controllers/room/recording.js";
import { getUser } from "../controllers/user.js";

const router = express.Router();

router.get("/rooms", getRooms);
router.post("/room/create", createRoom);
router.post("/room/:roomId/update", updateRoom);
router.get("/room/:roomId/delete", deleteRoom);

router.get("/room/:roomId/enter", enterRoom);
router.get("/room/:roomId/leave", leaveRoom);
router.get("/room/:roomId/token", getSessionToken);

router.get("/room/:roomId/messages", getMessages);
router.post("/room/:roomId/message/send", upload.array("files"), sendMessage);

router.get("/room/:roomId/recording/start", startRecording);
router.post("/room/:roomId/recording/stop", stopRecording);

router.get("/file/:fileId/download", getFile);

router.get("/user", getUser);

export default router;
