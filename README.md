# GoDutch

GoDutch is a split-expense app with:

- A `FastAPI` backend in `backend/`
- A `React` frontend in `frontend/`
- A local `MongoDB` database

## Prerequisites

Install these first:

- Python 3.11+
- Node.js 18+ and npm
- MongoDB running locally on `mongodb://localhost:27017`

## Run The App

You need to run the backend and frontend in two separate terminals.

### 1. Start MongoDB

Make sure your local MongoDB server is running before starting the app.

To verify MongoDB is running on Windows:

```powershell
Get-Service | Where-Object { $_.Name -like '*Mongo*' }
```

If MongoDB is running as a Windows service, its `Status` should be `Running`.

You can also confirm that MongoDB is listening on the default port:

```powershell
Test-NetConnection localhost -Port 27017
```

If `TcpTestSucceeded` is `True`, MongoDB is reachable on `localhost:27017`.

If MongoDB is installed as a service but is stopped, start it with:

```powershell
Start-Service MongoDB
```

### 2. Start the backend

Open a terminal in the project root and run these commands:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Important: if you run `pip install -r requirements.txt` from the project root, it will fail because `requirements.txt` lives inside `backend/`.

Backend will be available at:

- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### 3. Configure backend environment

Create `backend/.env` with these values:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=godutch
JWT_SECRET=your-local-secret
CORS_ORIGINS=http://localhost:3000
GEMINI_API_KEY=
```

Notes:

- `GEMINI_API_KEY` is only needed for AI-powered features like OCR and smart split.
- Keep real secrets out of source control.

### 4. Start the frontend

Open a second terminal in the project root and run these commands:

```powershell
cd frontend
npm install
npm start
```

Frontend will be available at:

- `http://localhost:3000`

### 5. Configure frontend environment

Create `frontend/.env` with:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Quick Start Summary

Terminal 1:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2:

```powershell
cd frontend
npm install
npm start
```

Then open `http://localhost:3000`.

## Troubleshooting

- If the frontend cannot reach the backend, check that `frontend/.env` points to `http://localhost:8000`.
- If the backend fails on startup, confirm MongoDB is running and `backend/.env` exists.
- If PowerShell blocks the virtual environment activation, run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```
