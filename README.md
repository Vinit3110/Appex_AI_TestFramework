# QBot

### AI-Powered Cross-Platform Test Automation

Describe a test in plain English. Gemini generates the steps. Playwright executes them. Firebase stores the results.

**Built by Team Apex · Gemini Genaithon Hackathon (PS No. 02) · KBTCOE, Nashik**

---

## Overview

Manual test scripting is slow, fragile, and a barrier for teams that aren't deeply technical. QBot removes that barrier entirely.

You describe what you want to test in plain English. The Gemini AI engine breaks your description into structured, executable steps and hands them to Playwright, which runs them against your target — Web or Mobile. Results, screenshots, and AI-generated failure explanations are stored in Firebase and surfaced through a React dashboard. The entire platform ships as a single Docker container.

```
Plain English description
        │
        ▼
  Gemini AI generates steps          ← @google/generative-ai
        │
        ▼
  Playwright executes on Web/Mobile  ← @playwright/test 1.43.0
        │
        ▼
  Express backend stores results     ← in Firebase Admin → Firestore
        │
        ▼
  React dashboard + AI analysis      ← served from the same Express process
```

---

## Architecture

The production build is a single container (`appex-platform`) that runs the Express backend on port `3001`. Express serves both the REST API and the compiled React frontend as static files from `frontend/dist`. Test reports and failure screenshots are written to a named Docker volume (`appex-reports`) so they survive container restarts.

The Dockerfile uses a two-stage build: Stage 1 compiles the React app with Vite; Stage 2 uses the official Playwright base image (`mcr.microsoft.com/playwright:v1.43.0-jammy`) so browser binaries are pre-installed in the final image, and the Express server + compiled frontend are layered on top.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| AI Engine | Google Gemini (`@google/generative-ai`) | ^0.21.0 |
| Web Testing | Playwright | ^1.43.0 |
| Backend | Node.js + Express | ^4.19.2 |
| Frontend | React + Vite | — |
| Database | Firebase Firestore (`firebase-admin`) | ^12.0.0 |
| Runtime | Node.js | ≥ 18.0.0 |
| Container | Docker + Docker Compose | — |
| Dev server | nodemon | ^3.1.0 |

---

## Project Structure

```
Appex_AI_TestFramework/
├── backend/
│   ├── server.js                   # Express entry point — API + static frontend
│   ├── test-engine/
│   │   └── web/
│   │       ├── pages/              # Page Object Models
│   │       │   ├── LoginPage.js
│   │       │   └── InventoryPage.js
│   │       └── tests/
│   │           └── login.spec.js
│   └── reports/
│       ├── test-results.json       # Machine-readable run output
│       └── artifacts/              # Failure screenshots
├── frontend/                       # React dashboard (built → frontend/dist)
├── firebase/                       # Firebase config and Firestore helpers
├── test-ai.js                      # Gemini AI test-step generator
├── playwright.config.js
├── Dockerfile                      # Two-stage build (Vite → Playwright image)
├── docker-compose.yml              # Single service, port 3001, named volume
├── .env.example
└── package.json
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose (recommended — everything else is inside the container)
- [Node.js](https://nodejs.org/) ≥ 18 (only needed for local development outside Docker)
- A **Google Gemini API key** — [get one free at Google AI Studio](https://aistudio.google.com/)
- A **Firebase project** with Firestore enabled — [console.firebase.google.com](https://console.firebase.google.com/)

---

### Option A — Docker (recommended)

This is the fastest path. The container includes Node, Playwright, and all browser binaries.

**1. Clone and configure**

```bash
git clone https://github.com/Omsongire23/Appex_AI_TestFramework.git
cd Appex_AI_TestFramework
cp .env.example .env
```

**2. Fill in `.env`**

```env
# App
BASE_URL=https://www.saucedemo.com

# SauceDemo test credentials
VALID_USERNAME=standard_user
VALID_PASSWORD=secret_sauce

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Backend
PORT=3001
```

**3. Build and run**

```bash
docker-compose up --build
```

The backend API and dashboard are now available at **http://localhost:3001**.

Health check: `GET http://localhost:3001/api/health`

---

### Option B — Local development (no Docker)

```bash
git clone https://github.com/Omsongire23/Appex_AI_TestFramework.git
cd Appex_AI_TestFramework
cp .env.example .env   # fill in your keys as above

npm install
npx playwright install

# Start the backend with hot reload
npm run server: dev

# In a separate terminal, start the frontend dev server
cd frontend && npm install && npm run dev
```

---

### Running Playwright tests directly

```bash
npm test                  # headless (CI default)
npm run test:headed       # headed — watch the browser
npm run test:debug        # Playwright Inspector, step through each action
npm run test:report       # open the last HTML report
```

---

## Test Suite

| ID | Scenario | Expected outcome |
|---|---|---|
| TC-01 | Valid credentials | Redirects to `/inventory` |
| TC-02 | Wrong password | Error: credentials do not match |
| TC-03 | Empty username | Error: Username is required |
| TC-04 | Empty password | Error: Password is required |
| TC-05 | Both fields empty | Error banner appears |
| TC-06 | Locked-out user | Error: user has been locked out |
| TC-07 | Login → Logout → Re-login | Second login succeeds |

---

## How to Use QBot

1. Open the dashboard at `http://localhost:3001`
2. Click **New Test** and describe what you want to test in plain English, for example:
   > *"Go to the login page, enter valid credentials, and verify the user is redirected to the inventory page."*
3. Click **Generate Steps** — Gemini breaks your description into structured, executable test steps
4. Select your target platform (Web or Mobile) and click **Run**
5. View the results — pass/fail status, failure screenshots, and an AI-generated explanation of what went wrong

---

## Team Apex

| Name | GitHub |
|---|---|
| Om Songire | [@Omsongire23](https://github.com/Omsongire23) |
| Vinit Deore | [@Vinit3110](https://github.com/Vinit3110) |
| Suyog Deore | — |
| Dronav Dalvi | — |
| Kalpesh Chavan | [@kalpesh-28](https://github.com/kalpesh-28) |

---

## License

[MIT](LICENSE)
