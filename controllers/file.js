import mongoose from "mongoose";
import { gfs } from "./../config/mongoose.js";

export const getFile = async (req, res) => {
  try {
    const fileId = new mongoose.mongo.ObjectId(req.params.fileId);

    const files = await gfs.find({ _id: fileId }).toArray();
    const file = files[0];

    res.set({
      "Content-Disposition": `attachment; filename=${file.filename}`,
      "Content-Type": file.contentType,
    });

    gfs.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(404).end();
  }
};
