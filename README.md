# GenAI Interview Prep Platform

MERN app that turns a resume (PDF) or self-description plus a job description into an AI interview report
(match score, technical/behavioral questions, skill gaps, day-by-day prep plan) and a tailored resume PDF.
Stack: React 19 + Vite + SCSS, Express 5, MongoDB (Mongoose), Google Gemini 2.5 Flash, Puppeteer, JWT cookie auth.

## Run locally
Requirements: Node 20+, a MongoDB Atlas (or local) URI, a Gemini API key from https://aistudio.google.com/apikey

### Backend (http://localhost:3000)
    cd Backend
    cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, GOOGLE_GENAI_API_KEY
    npm install
    npm run dev

### Frontend (http://localhost:5173)
    cd Frontend
    cp .env.example .env
    npm install
    npm run dev
