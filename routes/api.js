import express from "express";
import { upload } from "../config/mongoose.js";
import { getFile } from "../controllers/file.js";
import { createRoom, deleteRoom, enterRoom, getRooms, leaveRoom, updateRoom } from "../controllers/room/crud.js";
import { getMessages, sendMessage } from "../controllers/room/messaging.js";
import { startRecording, stopRecording } from "../controllers/room/recording.js";
import { connectToSession, disconnectFromSession } from "../controllers/room/session.js";
import { getUser } from "../controllers/user.js";

const router = express.Router();

router.get("/rooms", getRooms);
router.post("/room/create", createRoom);
router.post("/room/:roomId/update", updateRoom);
router.get("/room/:roomId/delete", deleteRoom);

router.get("/room/:roomId/enter", enterRoom);
router.get("/room/:roomId/leave", leaveRoom);

router.get("/room/:roomId/messages", getMessages);
router.post("/room/:roomId/message/send", upload.array("files"), sendMessage);

router.post("/room/:roomId/recording/start", startRecording);
router.post("/room/:roomId/recording/stop", stopRecording);

router.get("/room/:roomId/session/connect", connectToSession);
router.post("/room/:roomId/session/disconnect", disconnectFromSession);

router.get("/file/:fileId/download", getFile);

router.get("/user", getUser);

export default router;
