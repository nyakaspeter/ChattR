import express from "express";
import { ensureAuthenticated } from "./../controllers/auth.js";
import apiRoutes from "./api.js";
import authRoutes from "./auth.js";

const router = express.Router();

router.use(authRoutes);
router.use("/api", ensureAuthenticated, apiRoutes);

export default router;
