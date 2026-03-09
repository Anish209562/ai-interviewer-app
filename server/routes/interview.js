import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { startInterview, answerQuestion, getHistory, getSession } from '../controllers/interview.ctrl.js';

const router = express.Router();

router.post('/start', requireAuth, startInterview);
router.post('/:id/answer', requireAuth, answerQuestion);
router.get('/history', requireAuth, getHistory);
router.get('/:id', requireAuth, getSession);

export default router;
