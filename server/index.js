import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';
import resumeRoutes from './routes/resume.js';

dotenv.config();

const app = express();

// =============================
// ✅ Middleware
// =============================
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://ai-interviewer-app-nu.vercel.app',
    ],
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
// 🔑 GROQ KEY CHECK ROUTE
// =============================
app.get('/api/keycheck', (req, res) => {
  res.json({
    groqKeyLoaded: !!process.env.GROQ_API_KEY
  });
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
    console.log('✅ Connected to MongoDB');
    console.log('🔑 Groq Key Loaded:', !!process.env.GROQ_API_KEY);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });