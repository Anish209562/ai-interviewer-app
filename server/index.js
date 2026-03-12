import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';
import resumeRoutes from './routes/resume.js';
import agentRoutes from './routes/agent.js';
import { getGroqApiKey, getJwtSecret } from './utils/env.js';

dotenv.config();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-interviewer-app-nu.vercel.app',
  ...((process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)),
];

// =============================
// ✅ Middleware
// =============================
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());

// =============================
// ✅ Routes
// =============================
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/agent', agentRoutes);

// =============================
// ✅ Health Check
// =============================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend working perfectly 🚀'
  });
});

app.get('/', (req, res) => {
  res.send('✅ Server is running');
});

// =============================
// ✅ Database Connection
// =============================
const PORT = process.env.PORT || 5050;

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/ai-interviewer';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    getJwtSecret();
    getGroqApiKey();

    console.log('✅ Connected to MongoDB');
    console.log('🔑 Groq Key Loaded:', true);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
