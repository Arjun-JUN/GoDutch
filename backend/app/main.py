import logging
import os

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.database import client, db
from app.routes import ai, auth, expenses, groups, settlements, upi

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="GoDutch API", version="1.0.0")

# Create master API router
api_router = APIRouter(prefix="/api")

# Include feature routers
api_router.include_router(auth.router)
api_router.include_router(groups.router)
api_router.include_router(expenses.router)
api_router.include_router(upi.router)
api_router.include_router(ai.router)
api_router.include_router(settlements.router)

# Only include dev routes in non-production environments
if os.getenv("ENV") != "production":
    from app.routes import dev
    api_router.include_router(dev.router)

# Include master router in app
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    # Removed seeding logic
    pass

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Closing database connection...")
    client.close()

# CORS Middleware configuration
cors_origins = [
    origin.strip()
    for origin in os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    # Local dev often shifts between localhost/127.0.0.1 and ports like 3000/3001.
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin"],
)
