from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'godutch')

try:
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
    db = client[db_name]
    client.server_info()  # Try to ping
    print(f"Successfully connected to MongoDB at {mongo_url}, database: {db_name}")
except Exception as e:
    print(f"Failed to connect to MongoDB: {str(e)}")
