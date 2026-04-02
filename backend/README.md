# GoDutch Backend

The core API for the GoDutch application, built with FastAPI and MongoDB.

## Architecture
The backend has been refactored from a monolithic `server.py` into a modular FastAPI package structure:
- `app/main.py`: Application entry point and route registrations.
- `app/database.py`: MongoDB connection and database utilities.
- `app/auth/`: JWT-based authentication logic.
- `app/models/`: Pydantic schemas for request/response validation.
- `app/routes/`: Organized API endpoints (expenses, groups, upi, etc.).
- `app/utils/`: Helper functions including AI and OCR logic.

## Getting Started

### 1. Environment Setup
Create a `.env` file in the `backend` directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=godutch
JWT_SECRET=your-secure-secret
CORS_ORIGINS=http://localhost:3000
GEMINI_API_KEY=your_key_here
```

### 2. Dependency Installation
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Running the Server
```powershell
python -m uvicorn app.main:app --reload --port 8000
```

## API Documentation
Once the server is running, you can access the interactive documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Seeding
To populate the database with realistic development data:
```powershell
python seed.py
```
This will create test users, groups, and expenses for immediate testing.
