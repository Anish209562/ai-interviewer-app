# AI Interview Simulator

A full-stack web application designed to help candidates prepare for technical interviews using Google Gemini AI.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens (JWT).
- **AI**: Google Gemini API (`gemini-1.5-flash`).

## Features
- **Job Role Selection**: Practice tailored questions for specific roles (Frontend, Backend, etc).
- **Interactive Chat UI**: Answer questions one by one with real-time feedback.
- **AI Evaluation**: Gemini assesses your answers on a scale from 1-10 with constructive feedback.
- **Resume Analyzer**: Paste your resume to extract skills and find missing gaps for typical software roles.
- **History Dashboard**: Review all past interview sessions.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- Google Gemini API Key. Get one at [Google AI Studio](https://aistudio.google.com/).

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
4. Fill in your `GEMINI_API_KEY` and `MONGO_URI` in `server/.env`.
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
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

## Architecture Details
The project utilizes an MVC architecture on the backend, protecting core routes (`/api/interviews/*`, `/api/resume/analyze`) via JWT authentication middleware. 
The client is responsive and uses Tailwind v4, configured via a Vite plugin.
