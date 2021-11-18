import express from 'express';
import { upload } from '../config/mongoose.js';
import { getRoomSession } from '../controllers/call/getRoomSession.js';
import { getRoomToken } from '../controllers/call/getRoomToken.js';
import { hangupCall } from '../controllers/call/hangupCall.js';
import { startRecording } from '../controllers/call/startRecording.js';
import { stopRecording } from '../controllers/call/stopRecording.js';
import { getMessageFile } from '../controllers/message/getMessageFile.js';
import { getMessageRecording } from '../controllers/message/getMessageRecording.js';
import { getMessages } from '../controllers/message/getMessages.js';
import { sendMessage } from '../controllers/message/sendMessage.js';
import { createRoom } from '../controllers/room/createRoom.js';
import { deleteRoom } from '../controllers/room/deleteRoom.js';
import { getRoomImage } from '../controllers/room/getRoomImage.js';
import { getRoomInfo } from '../controllers/room/getRoomInfo.js';
import { getRooms } from '../controllers/room/getRooms.js';
import { joinRoom } from '../controllers/room/joinRoom.js';
import { joinRoomAccept } from '../controllers/room/joinRoomAccept.js';
import { joinRoomCancel } from '../controllers/room/joinRoomCancel.js';
import { joinRoomDecline } from '../controllers/room/joinRoomDecline.js';
import { leaveRoom } from '../controllers/room/leaveRoom.js';
import { updateRoom } from '../controllers/room/updateRoom.js';
import { getUser } from '../controllers/user/getUser.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.get('/rooms', getRooms);

router.post('/room/create', upload.single('image'), createRoom);

router.post(
  '/room/:roomId/update',
  authorize('roomOwner'),
  upload.single('image'),
  updateRoom
);

router.post('/room/:roomId/join', joinRoom);

router.get('/room/:roomId/join/cancel', joinRoomCancel);

router.get(
  '/room/:roomId/join/:userId/accept',
  authorize('roomOwner'),
  joinRoomAccept
);

router.get(
  '/room/:roomId/join/:userId/decline',
  authorize('roomOwner'),
  joinRoomDecline
);

router.get('/room/:roomId/leave', authorize('roomUser'), leaveRoom);

router.get('/room/:roomId/delete', authorize('roomOwner'), deleteRoom);

router.get('/room/:roomId/info', authorize('roomUser'), getRoomInfo);

router.get('/room/:roomId/image', getRoomImage);

router.get('/room/:roomId/messages', authorize('roomUser'), getMessages);

router.post(
  '/room/:roomId/message/send',
  authorize('roomUser'),
  upload.array('files'),
  sendMessage
);

router.get(
  '/room/:roomId/message/:messageId/files/:fileId/download',
  authorize('roomUser'),
  getMessageFile
);

router.get(
  '/room/:roomId/message/:messageId/recording/:recordingId/download',
  authorize('roomUser'),
  getMessageRecording
);

router.get('/room/:roomId/session', authorize('roomUser'), getRoomSession);
router.get('/room/:roomId/token', authorize('roomUser'), getRoomToken);
router.get('/room/:roomId/hangup', authorize('roomUser'), hangupCall);

router.get(
  '/room/:roomId/recording/start',
  authorize('roomOwner'),
  startRecording
);

router.get(
  '/room/:roomId/recording/stop',
  authorize('roomOwner'),
  stopRecording
);

router.get('/user', getUser);

export default router;
