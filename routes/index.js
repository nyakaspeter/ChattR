import express from "express";

import authRoutes from "./auth.js";
import apiRoutes from "./api.js";
import { ensureAuthenticated } from "./../controllers/auth.js";

const router = express.Router();

router.use(authRoutes);
router.use("/api", ensureAuthenticated, apiRoutes);

export default router;
