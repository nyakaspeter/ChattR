import express from 'express';
import { upload } from '../config/mongoose.js';
import { getMessageFile } from '../controllers/message/getMessageFile.js';
import { getMessages } from '../controllers/message/getMessages.js';
import { sendMessage } from '../controllers/message/sendMessage.js';
import { startRecording } from '../controllers/recording/startRecording.js';
import { stopRecording } from '../controllers/recording/stopRecording.js';
import { createRoom } from '../controllers/room/createRoom.js';
import { deleteRoom } from '../controllers/room/deleteRoom.js';
import { getRoomImage } from '../controllers/room/getRoomImage.js';
import { getRoomInfo } from '../controllers/room/getRoomInfo.js';
import { getRooms } from '../controllers/room/getRooms.js';
import { getRoomToken } from '../controllers/room/getRoomToken.js';
import { joinRoom } from '../controllers/room/joinRoom.js';
import { joinRoomCancel } from '../controllers/room/joinRoomCancel.js';
import { joinRoomAccept } from '../controllers/room/joinRoomAccept.js';
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

router.get('/room/:roomId/token', authorize('roomUser'), getRoomToken);

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
  '/room/:roomId/recording/start',
  authorize('roomUser'),
  startRecording
);

router.post(
  '/room/:roomId/recording/stop',
  authorize('roomUser'),
  stopRecording
);

router.get('/user', getUser);

export default router;
