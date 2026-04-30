# Shikshak AI

A virtual teaching platform built with React and Express.js.

## Project Structure

```text
shikshak-ai/
|-- frontend/          # React + Vite frontend
|   |-- src/
|   |   |-- Components/Pages/   # Page components
|   |   |-- services/           # API and auth services
|   |   |-- assets/             # Static assets
|   |   |-- App.jsx             # Root component with routing
|   |   `-- main.jsx            # Entry point
|   |-- index.html
|   |-- vite.config.js
|   `-- package.json
|-- backend/           # Express.js API server
|   |-- config/        # Local storage configuration
|   |-- controllers/   # Route handlers
|   |-- data/          # Local JSON persistence
|   |-- middleware/    # Auth, validation, upload middleware
|   |-- routes/        # API route definitions
|   |-- services/      # Email and OTP services
|   |-- utils/         # Token generation utilities
|   |-- uploads/       # File uploads (books, covers)
|   |-- server.js      # Entry point
|   `-- package.json
|-- package.json       # Root scripts (run both)
`-- .gitignore
```

## Getting Started

### Prerequisites

- Node.js (v18+)

### Installation

```bash
npm install
npm run install:all
```

### Configuration

Create `backend/.env`:

```env
PORT=2000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
STORAGE_DRIVER=local-json
JWT_SECRET=change-this-local-jwt-secret
JWT_REFRESH_SECRET=change-this-local-refresh-secret
EMAIL_USER=
EMAIL_PASS=
```

If `EMAIL_USER` and `EMAIL_PASS` are blank, OTP and welcome emails are logged locally instead of being sent through Gmail.

### Running

```bash
npm run dev
```

Or run each app separately:

```bash
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:2000
```

### Data Storage

The backend now stores all app data in `backend/data/db.json`.

### Build

```bash
npm run build
npm start
```

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, MUI, React Router, Nivo Charts, FullCalendar

**Backend:** Express.js 5, local JSON storage, JWT, Nodemailer, Multer
