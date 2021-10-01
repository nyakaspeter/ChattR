import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

dotenv.config();

const UPLOAD_BUCKET_NAME = process.env.MONGODB_UPLOAD_BUCKET_NAME || "uploads";
const UPLOAD_MAX_FILE_SIZE = process.env.MONGODB_UPLOAD_MAX_FILE_SIZE || 50 * 1024 * 1024;

export let gfs;

mongoose.connect(process.env.MONGODB_URI).catch((err) => console.log(err.message));

mongoose.connection.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: UPLOAD_BUCKET_NAME,
  });
});

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
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
