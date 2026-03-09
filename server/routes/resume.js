import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { analyzeUserResume } from '../controllers/resume.ctrl.js';

const router = express.Router();

router.post('/analyze', requireAuth, analyzeUserResume);

export default router;
