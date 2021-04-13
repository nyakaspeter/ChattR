import express from "express";

import roomRoutes from "./rooms.js";

const router = express.Router();

router.use("/room", roomRoutes);

export default router;
