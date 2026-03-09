# AI Interview Simulator

A full-stack web application designed to help candidates prepare for technical interviews using Groq AI.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens (JWT).
- **AI**: Groq API (`llama-3.1-8b-instant`).

## Features
- **Job Role Selection**: Practice tailored questions for specific roles (Frontend, Backend, etc).
- **Interactive Chat UI**: Answer questions one by one with real-time feedback.
- **AI Evaluation**: Groq assesses your answers on a scale from 1-10 with constructive feedback.
- **Resume Analyzer**: Paste your resume to extract skills and find missing gaps for typical software roles.
- **History Dashboard**: Review all past interview sessions.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- Groq API Key. Get one from the [Groq Console](https://console.groq.com/keys).

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Fill in your `GROQ_API_KEY`, `JWT_SECRET`, and `MONGO_URI` in `server/.env`.
5. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set `VITE_API_URL` in `client/.env` if your backend is running on a different URL.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:5173`.

## Architecture Details
The project utilizes an MVC architecture on the backend, protecting core routes (`/api/interviews/*`, `/api/resume/analyze`) via JWT authentication middleware. 
The client is responsive and uses Tailwind v4, configured via a Vite plugin.
