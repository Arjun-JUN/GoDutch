from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.getenv('JWT_SECRET', 'fallback-secret')
EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY', '')

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: User

class GroupCreate(BaseModel):
    name: str
    member_emails: List[str]

class Group(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    members: List[Dict]
    created_by: str
    created_at: str

class ExpenseItem(BaseModel):
    name: str
    price: float
    assigned_to: List[str] = []

class SplitDetail(BaseModel):
    user_id: str
    user_name: str
    amount: float

class ExpenseCreate(BaseModel):
    group_id: str
    merchant: str
    date: str
    total_amount: float
    items: List[ExpenseItem]
    split_type: str
    split_details: List[SplitDetail]
    receipt_image: Optional[str] = None

class Expense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    group_id: str
    created_by: str
    merchant: str
    date: str
    total_amount: float
    items: List[ExpenseItem]
    split_type: str
    split_details: List[SplitDetail]
    receipt_image: Optional[str] = None
    created_at: str

class OCRRequest(BaseModel):
    image_base64: str

class OCRResult(BaseModel):
    merchant: str
    date: str
    total_amount: float
    items: List[Dict]

class SettlementItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    from_user_id: str
    from_user_name: str
    to_user_id: str
    to_user_name: str
    amount: float

class MarkPaidRequest(BaseModel):
    group_id: str
    from_user_id: str
    to_user_id: str
    amount: float

def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.replace('Bearer ', '')
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": password_hash,
        "name": user_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = jwt.encode(
        {"user_id": user_id, "email": user_data.email, "exp": datetime.now(timezone.utc) + timedelta(days=30)},
        JWT_SECRET,
        algorithm='HS256'
    )
    
    user = User(id=user_id, email=user_data.email, name=user_data.name, created_at=user_doc["created_at"])
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user_doc['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {"user_id": user_doc['id'], "email": user_doc['email'], "exp": datetime.now(timezone.utc) + timedelta(days=30)},
        JWT_SECRET,
        algorithm='HS256'
    )
    
    user = User(id=user_doc['id'], email=user_doc['email'], name=user_doc['name'], created_at=user_doc['created_at'])
    return TokenResponse(token=token, user=user)

@api_router.post("/ocr/scan", response_model=OCRResult)
async def scan_receipt(request: OCRRequest, current_user: dict = Depends(verify_token)):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"ocr_{uuid.uuid4()}",
            system_message="You are an expert at extracting structured data from receipt images. Extract merchant name, date, items with prices, and total amount. Return as JSON."
        ).with_model("openai", "gpt-5.2")
        
        image_content = ImageContent(image_base64=request.image_base64)
        
        prompt = """Extract the following from this receipt:
        - merchant: store/restaurant name
        - date: transaction date (YYYY-MM-DD format)
        - total_amount: total amount as a number
        - items: array of {name: string, price: number}
        
        Return ONLY valid JSON, no markdown or extra text."""
        
        user_message = UserMessage(
            text=prompt,
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        import json
        result = json.loads(response.strip())
        
        return OCRResult(**result)
    except Exception as e:
        logging.error(f"OCR error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@api_router.post("/groups", response_model=Group)
async def create_group(group_data: GroupCreate, current_user: dict = Depends(verify_token)):
    member_users = await db.users.find({"email": {"$in": group_data.member_emails}}, {"_id": 0}).to_list(100)
    
    if len(member_users) != len(group_data.member_emails):
        raise HTTPException(status_code=400, detail="Some member emails not found")
    
    members = [{"id": u['id'], "email": u['email'], "name": u['name']} for u in member_users]
    
    group_id = str(uuid.uuid4())
    group_doc = {
        "id": group_id,
        "name": group_data.name,
        "members": members,
        "created_by": current_user['user_id'],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.groups.insert_one(group_doc)
    
    return Group(**group_doc)

@api_router.get("/groups", response_model=List[Group])
async def get_groups(current_user: dict = Depends(verify_token)):
    groups = await db.groups.find(
        {"members.id": current_user['user_id']},
        {"_id": 0}
    ).to_list(1000)
    return groups

@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(verify_token)):
    expense_id = str(uuid.uuid4())
    expense_doc = {
        "id": expense_id,
        "group_id": expense_data.group_id,
        "created_by": current_user['user_id'],
        "merchant": expense_data.merchant,
        "date": expense_data.date,
        "total_amount": expense_data.total_amount,
        "items": [item.model_dump() for item in expense_data.items],
        "split_type": expense_data.split_type,
        "split_details": [split.model_dump() for split in expense_data.split_details],
        "receipt_image": expense_data.receipt_image,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.expenses.insert_one(expense_doc)
    
    return Expense(**expense_doc)

@api_router.get("/groups/{group_id}/expenses", response_model=List[Expense])
async def get_group_expenses(group_id: str, current_user: dict = Depends(verify_token)):
    group = await db.groups.find_one({"id": group_id, "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found or access denied")
    
    expenses = await db.expenses.find({"group_id": group_id}, {"_id": 0}).to_list(1000)
    return expenses

@api_router.get("/groups/{group_id}/settlements", response_model=List[SettlementItem])
async def get_settlements(group_id: str, current_user: dict = Depends(verify_token)):
    group = await db.groups.find_one({"id": group_id, "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found or access denied")
    
    expenses = await db.expenses.find({"group_id": group_id}, {"_id": 0}).to_list(1000)
    
    balances = {}
    for member in group['members']:
        balances[member['id']] = {"name": member['name'], "balance": 0.0}
    
    for expense in expenses:
        paid_by = expense['created_by']
        for split in expense['split_details']:
            if split['user_id'] != paid_by:
                balances[split['user_id']]['balance'] -= split['amount']
                balances[paid_by]['balance'] += split['amount']
    
    settlements = []
    debtors = [(uid, data) for uid, data in balances.items() if data['balance'] < -0.01]
    creditors = [(uid, data) for uid, data in balances.items() if data['balance'] > 0.01]
    
    for debtor_id, debtor_data in debtors:
        for creditor_id, creditor_data in creditors:
            if abs(debtor_data['balance']) < 0.01 or creditor_data['balance'] < 0.01:
                continue
            
            amount = min(abs(debtor_data['balance']), creditor_data['balance'])
            settlements.append(SettlementItem(
                from_user_id=debtor_id,
                from_user_name=debtor_data['name'],
                to_user_id=creditor_id,
                to_user_name=creditor_data['name'],
                amount=round(amount, 2)
            ))
            
            debtor_data['balance'] += amount
            creditor_data['balance'] -= amount
    
    return settlements

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()