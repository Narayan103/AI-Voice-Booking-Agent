
# Voice Command App with Gemini API
An intelligent AI-powered voice assistant that simulates real phone-call conversations to automate salon appointment bookings.

🧠 Features
🎙️ Real-time voice interaction (continuous mic listening)
🤖 AI-powered conversation using Gemini API
🗣️ Natural call-like experience with interruption handling
📅 Automated appointment booking system
📊 Backend storage & retrieval of bookings

⚡ Fast and responsive full-stack architecture

🛠️ Tech Stack
Frontend: React.js
Backend: Node.js, Express.js
Database: MongoDB
AI Integration: Gemini API
Voice Handling: Web Speech API / custom logic

⚙️ How It Works
User speaks through microphone
AI processes voice → converts to text
Gemini API detects intent & generates response
System replies using speech synthesis
Booking data is stored in MongoDB

📸 Demo Flow
User: “I want a haircut tomorrow”
AI: “Sure, what time would you prefer?”
User: “5 PM”

✅ Booking confirmed and stored in database
This repository contains a full-stack voice-activated appointment booking app.

## Project structure

- `backend/` - Node.js Express API
  - `src/controllers` - route handlers
  - `src/models` - Mongoose models
  - `src/routes` - API routes
  - `src/services` - Gemini API integration

- `frontend/` - Vite + React UI
  - `src/components` - reusable UI components
  - `src/pages` - app pages
  - `src/services` - API and voice services

## Getting started

1. Install dependencies
   - `cd backend && npm install`
   - `cd ../frontend && npm install`

2. Configure environment
   - Copy `backend/.env.example` to `backend/.env`
   - Set Gemini API key, MongoDB URI, and other env variables

3. Run backend
   - `cd backend && npm run dev`

4. Run frontend
   - `cd frontend && npm run dev`

## Notes

- `.gitignore` includes node_modules, logs, dist/build outputs, env files, and IDE directories.
- Keep secret keys (Gemini API key) out of the repo and only in `.env`.
=======
