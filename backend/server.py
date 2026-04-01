from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import binascii
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
import requests
from seed import seed_data


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.getenv('JWT_SECRET')
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is missing. Cannot start securely.")
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

cors_origins = [origin.strip() for origin in os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',') if origin.strip()]

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)

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
    name: str = Field(..., min_length=2)
    member_emails: List[EmailStr]
    currency: str = "INR"

class Group(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    members: List[Dict]
    currency: str = "INR"
    created_by: str
    created_at: str

class ExpenseItem(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    quantity: int = Field(1, gt=0)
    category: str = "Other"
    assigned_to: List[str] = []

class SplitDetail(BaseModel):
    user_id: str
    user_name: str
    amount: float = Field(..., ge=0)

class ExpenseCreate(BaseModel):
    group_id: str
    merchant: str = Field(..., min_length=1)
    date: str
    total_amount: float = Field(..., gt=0)
    items: List[ExpenseItem]
    split_type: str
    split_details: List[SplitDetail]
    receipt_image: Optional[str] = None
    category: str = "Food & Dining"
    notes: Optional[str] = None

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
    category: str = "Food & Dining"
    notes: Optional[str] = None
    created_at: str

class ExpenseUpdate(BaseModel):
    merchant: Optional[str] = None
    date: Optional[str] = None
    total_amount: Optional[float] = None
    items: Optional[List[ExpenseItem]] = None
    split_type: Optional[str] = None
    split_details: Optional[List[SplitDetail]] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class SmartSplitRequest(BaseModel):
    group_id: str
    instruction: str
    expense_context: Optional[Dict] = None

class SmartSplitResponse(BaseModel):
    split_plan: Dict
    clarification_needed: bool = False
    clarification_question: Optional[str] = None

class UPIPaymentRequest(BaseModel):
    upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")
    amount: float = Field(..., gt=0)
    settlement_id: str
    note: Optional[str] = None

class BankAccount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    bank_name: str
    account_number: str
    ifsc_code: str
    account_holder: str
    upi_id: str
    balance: float
    is_primary: bool
    created_at: str

class BankAccountCreate(BaseModel):
    bank_name: str = Field(..., min_length=2)
    account_number: str = Field(..., min_length=8)
    ifsc_code: str = Field(..., pattern=r"^[A-Z]{4}0[A-Z0-9]{6}$")
    account_holder: str = Field(..., min_length=2)
    upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    from_user_id: str
    from_upi_id: str
    to_user_id: Optional[str] = None
    to_upi_id: str
    amount: float
    transaction_type: str
    status: str
    note: Optional[str] = None
    reference_id: str
    created_at: str

class TransactionCreate(BaseModel):
    to_upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")
    amount: float = Field(..., gt=0)
    transaction_type: str = "payment"
    note: Optional[str] = None

class MoneyRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    from_user_id: str
    from_upi_id: str
    to_user_id: str
    to_upi_id: str
    amount: float
    note: Optional[str] = None
    status: str
    created_at: str

class MoneyRequestCreate(BaseModel):
    to_upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")
    amount: float = Field(..., gt=0)
    note: Optional[str] = None

class BillPayment(BaseModel):
    biller_name: str = Field(..., min_length=2)
    bill_number: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    category: str

class RechargeRequest(BaseModel):
    mobile_number: str = Field(..., pattern=r"^\d{10}$")
    operator: str = Field(..., min_length=2)
    amount: float = Field(..., gt=0)
    recharge_type: str

class OCRRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"

class OCRItem(BaseModel):
    name: str
    price: float
    quantity: int

class OCRResult(BaseModel):
    merchant: str
    date: str
    total_amount: float
    items: List[OCRItem]


def handle_server_error(e: Exception, context: str, default_detail: str):
    if isinstance(e, HTTPException):
        raise e
    
    error_msg = str(e)
    logging.error(f"{context} error: {error_msg}")
    
    # Handle quota/billing-specific AI errors
    if "budget" in error_msg.lower() or "exceeded" in error_msg.lower():
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Upstream AI service is temporarily unavailable due to quota or billing limits."
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=default_detail if not str(e) else f"{default_detail}: {str(e)}"
    )


def _extract_json_block(text: str):
    import json

    stripped = text.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        start = stripped.find("{")
        end = stripped.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(stripped[start : end + 1])
        raise


async def generate_structured_content(parts, response_model):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Gemini API key not configured.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
        },
    }

    def _send_request():
        with requests.Session() as session:
            session.trust_env = False
            response = session.post(url, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()

    try:
        response_json = await run_in_threadpool(_send_request)
    except requests.HTTPError as exc:
        response = exc.response
        detail = "Upstream AI request failed."

        if response is not None:
            try:
                error_payload = response.json()
                detail = error_payload.get("error", {}).get("message") or detail
            except ValueError:
                detail = response.text or detail

            raise HTTPException(status_code=response.status_code, detail=detail) from exc

        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail) from exc

    candidates = response_json.get("candidates") or []
    if not candidates:
        raise ValueError(f"Gemini returned no candidates: {response_json}")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "".join(part.get("text", "") for part in parts if isinstance(part, dict))
    if not text:
        raise ValueError(f"Gemini returned no text: {response_json}")

    parsed = _extract_json_block(text)
    return response_model.model_validate(parsed)

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")
    
    token = authorization.replace('Bearer ', '')
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user_doc['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
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
        base64.b64decode(request.image_base64, validate=True)

        result = await generate_structured_content(
            parts=[
                {
                    "text": (
                        "You extract structured data from receipt images.\n"
                        "Return valid JSON only with this shape:\n"
                        "{"
                        "\"merchant\": string, "
                        "\"date\": \"YYYY-MM-DD\", \"total_amount\": number, "
                        "\"items\": [{\"name\": string, \"price\": number, \"quantity\": number}]"
                        "}\n"
                        "Instructions:\n"
                        "1. Every item MUST have a 'name', 'price', and 'quantity'.\n"
                        "2. If an item has a quantity (e.g., '2x Burger' or '3 Beer'), extract it and use the UNIT price (price per item) in the 'price' field.\n"
                        "3. If quantity is NOT mentioned on the receipt, you MUST explicitly set it to 1.\n"
                        "4. Ensure 'total_amount' is the sum of (price * quantity) for all items.\n"
                        "5. If an exact item list is not visible, return the best available items.\n"
                        "6. If the date is unclear, use an empty string."
                    )
                },
                {
                    "inlineData": {
                        "mimeType": request.mime_type,
                        "data": request.image_base64,
                    }
                },
            ],
            response_model=OCRResult,
        )

        return result
    except binascii.Error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid receipt image data.")
    except Exception as e:
        handle_server_error(e, "OCR", "OCR scanning failed. Please try again or enter details manually.")

@api_router.post("/groups", response_model=Group)
async def create_group(group_data: GroupCreate, current_user: dict = Depends(verify_token)):
    member_users = await db.users.find({"email": {"$in": group_data.member_emails}}, {"_id": 0}).to_list(100)
    
    current_user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not current_user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Current user not found")
    
    current_user_in_list = any(u['email'] == current_user_doc['email'] for u in member_users)
    
    if not current_user_in_list:
        member_users.append(current_user_doc)
    
    if len(member_users) < len(group_data.member_emails) + (0 if current_user_in_list else 1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Some member emails not found")
    
    members = [{"id": u['id'], "email": u['email'], "name": u['name']} for u in member_users]
    
    group_id = str(uuid.uuid4())
    group_doc = {
        "id": group_id,
        "name": group_data.name,
        "members": members,
        "currency": group_data.currency,
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
        "category": expense_data.category,
        "notes": expense_data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.expenses.insert_one(expense_doc)
    
    await db.expense_logs.insert_one({
        "id": str(uuid.uuid4()),
        "expense_id": expense_id,
        "action": "added",
        "user_id": current_user['user_id'],
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return Expense(**expense_doc)

@api_router.get("/groups/{group_id}/expenses", response_model=List[Expense])
async def get_group_expenses(group_id: str, current_user: dict = Depends(verify_token)):
    group = await db.groups.find_one({"id": group_id, "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or access denied")
    
    expenses = await db.expenses.find({"group_id": group_id}, {"_id": 0}).to_list(1000)
    return expenses

@api_router.get("/groups/{group_id}/settlements", response_model=List[SettlementItem])
async def get_settlements(group_id: str, current_user: dict = Depends(verify_token)):
    group = await db.groups.find_one({"id": group_id, "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or access denied")
    
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

@api_router.post("/ai/smart-split", response_model=SmartSplitResponse)
async def smart_split(request: SmartSplitRequest, current_user: dict = Depends(verify_token)):
    try:
        group = await db.groups.find_one({"id": request.group_id}, {"_id": 0})
        if not group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
        
        members_info = ", ".join([f"{m['name']} (id: {m['id']})" for m in group['members']])

        context = f"Expense context: {request.expense_context}" if request.expense_context else ""

        result = await generate_structured_content(
            parts=[
                {
                    "text": (
                        "You are an intelligent expense splitting assistant. "
                        "Create precise split plans using only the provided group member ids. "
                        "If the instruction is ambiguous, set clarification_needed to true and ask one concise question.\n\n"
                        "Return valid JSON only with this shape:\n"
                        "{"
                        "\"split_plan\": {"
                        "\"items\": [{\"name\": string, \"price\": number, \"quantity\": number, \"category\": string, \"assigned_to\": [string]}], "
                        "\"split_type\": \"custom|equal|item-based\""
                        "}, "
                        "\"clarification_needed\": boolean, "
                        "\"clarification_question\": string | null"
                        "}\n\n"
                        "Group members: "
                        f"{members_info}\n\n"
                        f"Instruction: {request.instruction}\n"
                        f"{context}"
                    )
                }
            ],
            response_model=SmartSplitResponse,
        )

        return result
    except Exception as e:
        handle_server_error(e, "Smart Split", "Smart split failed")

@api_router.post("/upi/initiate-payment")
async def initiate_upi_payment(payment: UPIPaymentRequest, current_user: dict = Depends(verify_token)):
    try:
        # Security check: Ensure user is only paying their own debts
        # settlement_id format: group_id(36)-from_user_id(36)-to_user_id(36)
        if len(payment.settlement_id) >= 110:
            group_id = payment.settlement_id[0:36]
            debtor_id = payment.settlement_id[37:73]
            to_user_id = payment.settlement_id[74:110]
            if debtor_id != current_user['user_id']:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only initiate payments for your own debts")
                
            # Security check: Verify that the UPI payment amount matches the specific settlement
            settlements = await get_settlements(group_id, current_user)
            valid_amount = False
            for s in settlements:
                if s.from_user_id == debtor_id and s.to_user_id == to_user_id and abs(s.amount - payment.amount) <= 0.01:
                    valid_amount = True
                    break
            if not valid_amount:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid settlement amount provided for this payment")

        payment_id = str(uuid.uuid4())
        
        upi_url = f"upi://pay?pa={payment.upi_id}&pn=goDutch&am={payment.amount}&cu=INR&tn={payment.note or 'Settlement'}"
        
        payment_doc = {
            "id": payment_id,
            "from_user": current_user['user_id'],
            "upi_id": payment.upi_id,
            "amount": payment.amount,
            "settlement_id": payment.settlement_id,
            "note": payment.note,
            "status": "initiated",
            "upi_url": upi_url,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payments.insert_one(payment_doc)
        
        return {
            "payment_id": payment_id,
            "upi_url": upi_url,
            "status": "initiated",
            "qr_data": upi_url
        }
    except Exception as e:
        handle_server_error(e, "UPI Payment", "Payment initiation failed")

@api_router.post("/upi/accounts", response_model=BankAccount)
async def add_bank_account(account: BankAccountCreate, current_user: dict = Depends(verify_token)):
    try:
        existing = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "upi_id": account.upi_id}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="UPI ID already linked")
        
        account_id = str(uuid.uuid4())
        
        is_primary = await db.bank_accounts.count_documents({"user_id": current_user['user_id']}) == 0
        
        account_doc = {
            "id": account_id,
            "user_id": current_user['user_id'],
            "bank_name": account.bank_name,
            "account_number": account.account_number,
            "ifsc_code": account.ifsc_code,
            "account_holder": account.account_holder,
            "upi_id": account.upi_id,
            "balance": 10000.00,
            "is_primary": is_primary,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.bank_accounts.insert_one(account_doc)
        
        return BankAccount(**account_doc)
    except Exception as e:
        handle_server_error(e, "Add Account", "Failed to add account")

@api_router.get("/upi/accounts", response_model=List[BankAccount])
async def get_bank_accounts(current_user: dict = Depends(verify_token)):
    accounts = await db.bank_accounts.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(100)
    return accounts

@api_router.post("/upi/send-money", response_model=Transaction)
async def send_money(transaction: TransactionCreate, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No bank account linked")
        
        if account['balance'] < transaction.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")
        
        recipient_account = await db.bank_accounts.find_one({"upi_id": transaction.to_upi_id}, {"_id": 0})
        
        transaction_id = str(uuid.uuid4())
        reference_id = f"UPI{uuid.uuid4().hex[:12].upper()}"
        
        transaction_doc = {
            "id": transaction_id,
            "from_user_id": current_user['user_id'],
            "from_upi_id": account['upi_id'],
            "to_user_id": recipient_account['user_id'] if recipient_account else None,
            "to_upi_id": transaction.to_upi_id,
            "amount": transaction.amount,
            "transaction_type": transaction.transaction_type,
            "status": "success",
            "note": transaction.note,
            "reference_id": reference_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.transactions.insert_one(transaction_doc)
        
        await db.bank_accounts.update_one(
            {"id": account['id']},
            {"$inc": {"balance": -transaction.amount}}
        )
        
        if recipient_account:
            await db.bank_accounts.update_one(
                {"id": recipient_account['id']},
                {"$inc": {"balance": transaction.amount}}
            )
        
        return Transaction(**transaction_doc)
    except Exception as e:
        handle_server_error(e, "Send Money", "Transaction failed")

@api_router.post("/upi/request-money", response_model=MoneyRequest)
async def request_money(request: MoneyRequestCreate, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No bank account linked")
        
        recipient_account = await db.bank_accounts.find_one({"upi_id": request.to_upi_id}, {"_id": 0})
        if not recipient_account:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="UPI ID not found")
        
        request_id = str(uuid.uuid4())
        
        request_doc = {
            "id": request_id,
            "from_user_id": current_user['user_id'],
            "from_upi_id": account['upi_id'],
            "to_user_id": recipient_account['user_id'],
            "to_upi_id": request.to_upi_id,
            "amount": request.amount,
            "note": request.note,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.money_requests.insert_one(request_doc)
        
        return MoneyRequest(**request_doc)
    except Exception as e:
        handle_server_error(e, "Request Money", "Request failed")

@api_router.get("/upi/requests", response_model=List[MoneyRequest])
async def get_money_requests(current_user: dict = Depends(verify_token)):
    account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
    if not account:
        return []
    
    requests = await db.money_requests.find(
        {"$or": [{"from_user_id": current_user['user_id']}, {"to_user_id": current_user['user_id']}]},
        {"_id": 0}
    ).to_list(100)
    
    return requests

@api_router.post("/upi/requests/{request_id}/accept")
async def accept_money_request(request_id: str, current_user: dict = Depends(verify_token)):
    try:
        money_request = await db.money_requests.find_one({"id": request_id, "to_user_id": current_user['user_id']}, {"_id": 0})
        if not money_request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
        
        if money_request['status'] != 'pending':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")
        
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if account['balance'] < money_request['amount']:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")
        
        transaction_id = str(uuid.uuid4())
        reference_id = f"UPI{uuid.uuid4().hex[:12].upper()}"
        
        transaction_doc = {
            "id": transaction_id,
            "from_user_id": current_user['user_id'],
            "from_upi_id": account['upi_id'],
            "to_user_id": money_request['from_user_id'],
            "to_upi_id": money_request['from_upi_id'],
            "amount": money_request['amount'],
            "transaction_type": "payment",
            "status": "success",
            "note": f"Payment for request: {money_request.get('note', '')}",
            "reference_id": reference_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.transactions.insert_one(transaction_doc)
        
        await db.bank_accounts.update_one(
            {"user_id": current_user['user_id'], "is_primary": True},
            {"$inc": {"balance": -money_request['amount']}}
        )
        
        await db.bank_accounts.update_one(
            {"user_id": money_request['from_user_id'], "is_primary": True},
            {"$inc": {"balance": money_request['amount']}}
        )
        
        await db.money_requests.update_one(
            {"id": request_id},
            {"$set": {"status": "accepted"}}
        )
        
        return {"status": "success", "transaction_id": transaction_id}
    except Exception as e:
        handle_server_error(e, "Accept Request", "Failed to accept request")

@api_router.get("/upi/transactions", response_model=List[Transaction])
async def get_transactions(current_user: dict = Depends(verify_token), limit: int = 50):
    account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
    if not account:
        return []
    
    transactions = await db.transactions.find(
        {"$or": [{"from_user_id": current_user['user_id']}, {"to_user_id": current_user['user_id']}]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return transactions

@api_router.post("/upi/bill-payment")
async def pay_bill(bill: BillPayment, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No bank account linked")
        
        if account['balance'] < bill.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")
        
        transaction_id = str(uuid.uuid4())
        reference_id = f"BILL{uuid.uuid4().hex[:12].upper()}"
        
        transaction_doc = {
            "id": transaction_id,
            "from_user_id": current_user['user_id'],
            "from_upi_id": account['upi_id'],
            "to_user_id": None,
            "to_upi_id": f"{bill.biller_name}@bills",
            "amount": bill.amount,
            "transaction_type": "bill_payment",
            "status": "success",
            "note": f"{bill.category} - {bill.biller_name} - {bill.bill_number}",
            "reference_id": reference_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.transactions.insert_one(transaction_doc)
        
        await db.bank_accounts.update_one(
            {"id": account['id']},
            {"$inc": {"balance": -bill.amount}}
        )
        
        return {"status": "success", "transaction_id": transaction_id, "reference_id": reference_id}
    except Exception as e:
        handle_server_error(e, "Bill Payment", "Bill payment failed")

@api_router.post("/upi/recharge")
async def mobile_recharge(recharge: RechargeRequest, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No bank account linked")
        
        if account['balance'] < recharge.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")
        
        transaction_id = str(uuid.uuid4())
        reference_id = f"RECH{uuid.uuid4().hex[:12].upper()}"
        
        transaction_doc = {
            "id": transaction_id,
            "from_user_id": current_user['user_id'],
            "from_upi_id": account['upi_id'],
            "to_user_id": None,
            "to_upi_id": f"{recharge.operator}@recharge",
            "amount": recharge.amount,
            "transaction_type": "recharge",
            "status": "success",
            "note": f"{recharge.recharge_type} - {recharge.mobile_number} - {recharge.operator}",
            "reference_id": reference_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.transactions.insert_one(transaction_doc)
        
        await db.bank_accounts.update_one(
            {"id": account['id']},
            {"$inc": {"balance": -recharge.amount}}
        )
        
        return {"status": "success", "transaction_id": transaction_id, "reference_id": reference_id}
    except Exception as e:
        handle_server_error(e, "Recharge", "Recharge failed")

@api_router.get("/expenses/categories")
async def get_expense_categories(current_user: dict = Depends(verify_token)):
    return {
        "categories": [
            "Food & Dining",
            "Transportation",
            "Entertainment",
            "Shopping",
            "Groceries",
            "Utilities",
            "Healthcare",
            "Travel",
            "Other"
        ]
    }

@api_router.get("/expenses/{expense_id}", response_model=Expense)
async def get_expense(expense_id: str, current_user: dict = Depends(verify_token)):
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    group = await db.groups.find_one({"id": expense["group_id"], "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return expense

@api_router.put("/expenses/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, update_data: ExpenseUpdate, current_user: dict = Depends(verify_token)):
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    
    # Check if user is a member of the group
    group = await db.groups.find_one({"id": expense["group_id"], "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only group members can edit this expense")
    update_fields = {}
    for field, value in update_data.model_dump(exclude_none=True).items():
        if field == "items":
            update_fields["items"] = [i.model_dump() for i in update_data.items]
        elif field == "split_details":
            update_fields["split_details"] = [s.model_dump() for s in update_data.split_details]
        else:
            update_fields[field] = value
    if update_fields:
        await db.expenses.update_one({"id": expense_id}, {"$set": update_fields})
        await db.expense_logs.insert_one({
            "id": str(uuid.uuid4()),
            "expense_id": expense_id,
            "action": "edited",
            "user_id": current_user['user_id'],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    updated = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    return updated

@api_router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: str, current_user: dict = Depends(verify_token)):
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    
    # Check if user is a member of the group
    group = await db.groups.find_one({"id": expense["group_id"], "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only group members can delete this expense")
        
    await db.expense_logs.insert_one({
        "id": str(uuid.uuid4()),
        "expense_id": expense_id,
        "action": "deleted",
        "user_id": current_user['user_id'],
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    await db.expenses.delete_one({"id": expense_id})

@api_router.get("/groups/{group_id}/reports")
async def get_expense_reports(group_id: str, current_user: dict = Depends(verify_token)):
    try:
        group = await db.groups.find_one({"id": group_id, "members.id": current_user['user_id']}, {"_id": 0})
        if not group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
        
        expenses = await db.expenses.find({"group_id": group_id}, {"_id": 0}).to_list(1000)
        
        total_spent = sum(e['total_amount'] for e in expenses)
        
        category_breakdown = {}
        for expense in expenses:
            category = expense.get('category', 'Other')
            category_breakdown[category] = category_breakdown.get(category, 0) + expense['total_amount']
        
        user_spending = {}
        for expense in expenses:
            for split in expense['split_details']:
                uid = split['user_id']
                uname = split['user_name']
                if uid not in user_spending:
                    user_spending[uid] = {"name": uname, "amount": 0}
                user_spending[uid]['amount'] += split['amount']
        
        monthly_trend = {}
        for expense in expenses:
            month = expense['date'][:7]
            monthly_trend[month] = monthly_trend.get(month, 0) + expense['total_amount']
        
        return {
            "total_expenses": len(expenses),
            "total_amount": round(total_spent, 2),
            "average_expense": round(total_spent / len(expenses), 2) if expenses else 0,
            "category_breakdown": category_breakdown,
            "user_spending": list(user_spending.values()),
            "monthly_trend": monthly_trend
        }
    except Exception as e:
        handle_server_error(e, "Reports", "Failed to generate reports")

@api_router.post("/dev/reset")
async def reset_db():
    if os.getenv("ENV", "development") != "development":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Reset not allowed in production")
    
    await db.users.delete_many({})
    await db.groups.delete_many({})
    await db.expenses.delete_many({})
    await db.bank_accounts.delete_many({})
    await db.transactions.delete_many({})
    await db.money_requests.delete_many({})
    await db.payments.delete_many({})
    
    await seed_data(db)
    return {"status": "success", "message": "Database reset and seeded with fresh fake data"}

app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    # Only seed in development
    if os.getenv("ENV") != "production":
        await seed_data(db)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    # Local dev often shifts between localhost/127.0.0.1 and ports like 3000/3001.
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
