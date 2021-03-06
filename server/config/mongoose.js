import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import User from '../models/user.js';

if (process.env.NODE_ENV !== 'test') dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
const UPLOAD_BUCKET_NAME = process.env.MONGODB_UPLOAD_BUCKET_NAME || 'uploads';
const UPLOAD_MAX_FILE_SIZE =
  process.env.MONGODB_UPLOAD_MAX_FILE_SIZE || 50 * 1024 * 1024;

export let gfs;

mongoose.connect(MONGODB_URL).catch(err => console.error(err));

mongoose.connection.once('open', async () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: UPLOAD_BUCKET_NAME,
  });

  await User.updateMany({}, { online: false });
});

const storage = new GridFsStorage({
  url: MONGODB_URL,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: UPLOAD_BUCKET_NAME,
      filename: file.originalname,
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: UPLOAD_MAX_FILE_SIZE },
});

export default mongoose;
