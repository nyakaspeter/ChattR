import express from "express";
import { authenticate } from "./../controllers/auth.js";
import apiRoutes from "./api.js";
import authRoutes from "./auth.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/api", authenticate, apiRoutes);

export default router;
