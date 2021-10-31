import express from 'express';
import { authenticate } from './../middlewares/authenticate.js';
import apiRoutes from './api.js';
import authRoutes from './auth.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/api', authenticate, apiRoutes);

export default router;
