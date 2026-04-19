# GoDutch

GoDutch is a premium split-expense application with a focus on high-fidelity UI and seamless ledger management. Built React Native-first for iOS and Android (web via React Native for Web, future).

- **Backend**: `FastAPI` (Python 3.11+) — `backend/`
- **Mobile**: `Expo` + React Native + NativeWind + Zustand v5 — `mobile/`
- **Database**: `MongoDB` (Local or Atlas)

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** & **pnpm**
- **MongoDB** running on `localhost:27017`

## Quick Start

```bash
# 1. Install root + mobile dependencies
pnpm install
cd mobile && pnpm install

# 2. Start backend + Expo dev server together
cd ..
pnpm dev
```

`pnpm dev` runs `concurrently`: FastAPI on port 8000 and `npx expo start` for the mobile app.

---

## Detailed Component Setup

### 1. Database (MongoDB)

Ensure MongoDB is active on your system. On Windows:

```powershell
Get-Service | Where-Object { $_.Name -like '*Mongo*' }
Start-Service MongoDB   # if stopped
```

### 2. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Environment (`backend/.env`):**

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=godutch
JWT_SECRET=your-secure-secret
CORS_ORIGINS=http://localhost:8081
GEMINI_API_KEY=your_key_here
```

### 3. Mobile App (Expo)

```powershell
cd mobile
pnpm install
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS/Android) or press `i`/`a` to open in a simulator.

**Environment (`mobile/.env`):**

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

---

## Running Tests

```bash
# Backend
pytest
pytest --cov=backend/app

# Mobile
cd mobile && pnpm test
cd mobile && pnpm test --coverage
```

---

## Core Features

- **Smart Settlements**: Real-time balance calculations across groups.
- **Expense Editing**: Edit merchant, amount, date, category, and notes in-place.
- **AI Smart Split**: Natural-language split instructions powered by Gemini.
- **AI Receipts**: OCR-powered expense extraction from receipt photos.
- **UPI Integration**: Native UPI deep links for instant payments.

## Troubleshooting

- **Backend 500 Errors**: Verify MongoDB is reachable and your `.env` variables are set.
- **CORS Issues**: Ensure `CORS_ORIGINS` in the backend matches your Expo URL (default `http://localhost:8081`).
- **Expo Go cache**: Run `npx expo start --clear` to reset the Metro bundler cache.
