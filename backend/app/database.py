import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'godutch')

if not mongo_url:
    raise RuntimeError("MONGO_URL environment variable is missing.")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

def get_db():
    return db
