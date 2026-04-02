# GoDutch

GoDutch is a premium split-expense application with a focus on high-fidelity UI and seamless ledger management.

- **Backend**: `FastAPI` (Python 3.11+) located in `backend/`
- **Frontend**: `React` (Vite, Slate UI) located in `frontend/`
- **Database**: `MongoDB` (Local or Atlas)

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** & **pnpm** (Recommended)
- **MongoDB** running on `localhost:27017`

## Quick Start

The fastest way to get the entire stack (Backend + Frontend) running is from the root directory:

```powershell
# 1. Install dependencies
pnpm install

# 2. Start the integrated dev server
pnpm dev
```

*Note: If you don't have pnpm installed, you can use `npm install` and `npm run dev` from the root, but pnpm is strictly recommended for frontend performance.*

---

## Detailed Component Setup

### 1. Database (MongoDB)
Ensure MongoDB is active on your system. On Windows:
```powershell
# Verify service status
Get-Service | Where-Object { $_.Name -like '*Mongo*' }
# If stopped, start it
Start-Service MongoDB
```

### 2. Backend Architecture
The backend has been refactored into a structured FastAPI package.

**Manual Setup:**
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
CORS_ORIGINS=http://localhost:3000
GEMINI_API_KEY=your_key_here
```

### 3. Frontend (Slate Design System)
The frontend uses the **Slate** design system for a premium look and feel.

**Manual Setup:**
```powershell
cd frontend
pnpm install
pnpm dev
```

**Environment (`frontend/.env`):**
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## Core Features
- **Smart Settlements**: Real-time balance calculations across groups.
- **UPI Integration**: Linked bank accounts and payment flows.
- **AI Receipts**: OCR-powered expense extraction (requires `GEMINI_API_KEY`).
- **Reports**: Deep spend analysis and group trends.

## Troubleshooting
- **Invalid hook call**: Ensure all dependencies are installed via `pnpm` and check for missing React imports in new components.
- **Backend 500 Errors**: Verify MongoDB is reachable and your `.env` variables (especially `JWT_SECRET`) are set.
- **CORS Issues**: Ensure `CORS_ORIGINS` in the backend matches your frontend URL (default `http://localhost:3000`).
