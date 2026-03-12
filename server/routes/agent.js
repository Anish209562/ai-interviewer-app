import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { chatWithAgent, clearAgentHistory, getAgentHistory } from '../controllers/agent.ctrl.js';

const router = express.Router();

router.post('/chat', requireAuth, chatWithAgent);
router.get('/history', requireAuth, getAgentHistory);
router.delete('/history', requireAuth, clearAgentHistory);

export default router;
