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
    category: str = "Other"
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

class SmartSplitRequest(BaseModel):
    group_id: str
    instruction: str
    expense_context: Optional[Dict] = None

class SmartSplitResponse(BaseModel):
    split_plan: Dict
    clarification_needed: bool = False
    clarification_question: Optional[str] = None

class UPIPaymentRequest(BaseModel):
    upi_id: str
    amount: float
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
    bank_name: str
    account_number: str
    ifsc_code: str
    account_holder: str
    upi_id: str

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
    to_upi_id: str
    amount: float
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
    to_upi_id: str
    amount: float
    note: Optional[str] = None

class BillPayment(BaseModel):
    biller_name: str
    bill_number: str
    amount: float
    category: str

class RechargeRequest(BaseModel):
    mobile_number: str
    operator: str
    amount: float
    recharge_type: str

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
        error_msg = str(e)
        logging.error(f"OCR error: {error_msg}")
        
        if "budget" in error_msg.lower() or "exceeded" in error_msg.lower():
            raise HTTPException(
                status_code=402,
                detail="OCR budget limit reached. Please top up your Universal Key balance in Profile → Universal Key → Add Balance."
            )
        
        raise HTTPException(status_code=500, detail=f"OCR scanning failed. Please try again or enter details manually.")

@api_router.post("/groups", response_model=Group)
async def create_group(group_data: GroupCreate, current_user: dict = Depends(verify_token)):
    member_users = await db.users.find({"email": {"$in": group_data.member_emails}}, {"_id": 0}).to_list(100)
    
    current_user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not current_user_doc:
        raise HTTPException(status_code=404, detail="Current user not found")
    
    current_user_in_list = any(u['email'] == current_user_doc['email'] for u in member_users)
    
    if not current_user_in_list:
        member_users.append(current_user_doc)
    
    if len(member_users) < len(group_data.member_emails) + (0 if current_user_in_list else 1):
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

@api_router.post("/ai/smart-split", response_model=SmartSplitResponse)
async def smart_split(request: SmartSplitRequest, current_user: dict = Depends(verify_token)):
    try:
        group = await db.groups.find_one({"id": request.group_id}, {"_id": 0})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        members_info = ", ".join([f"{m['name']} (id: {m['id']})" for m in group['members']])
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"smart_split_{uuid.uuid4()}",
            system_message=f"""You are an intelligent expense splitting assistant. 
Group members: {members_info}

Parse natural language instructions and create precise split plans.
Return ONLY valid JSON with this structure:
{{
  "split_plan": {{
    "items": [
      {{
        "name": "item name",
        "price": amount,
        "category": "category",
        "assigned_to": ["member_id1", "member_id2"]
      }}
    ],
    "split_type": "custom|equal|item-based"
  }},
  "clarification_needed": false,
  "clarification_question": null
}}

If unclear, set clarification_needed=true and ask a specific question."""
        ).with_model("openai", "gpt-5.2")
        
        context = f"Expense context: {request.expense_context}" if request.expense_context else ""
        prompt = f"{request.instruction}\n{context}"
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        result = json.loads(response.strip())
        
        return SmartSplitResponse(**result)
    except Exception as e:
        logging.error(f"Smart split error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Smart split failed: {str(e)}")

@api_router.post("/upi/initiate-payment")
async def initiate_upi_payment(payment: UPIPaymentRequest, current_user: dict = Depends(verify_token)):
    try:
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
        logging.error(f"UPI payment error: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment initiation failed")

@api_router.post("/upi/accounts", response_model=BankAccount)
async def add_bank_account(account: BankAccountCreate, current_user: dict = Depends(verify_token)):
    try:
        existing = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "upi_id": account.upi_id}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="UPI ID already linked")
        
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Add account error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add account")

@api_router.get("/upi/accounts", response_model=List[BankAccount])
async def get_bank_accounts(current_user: dict = Depends(verify_token)):
    accounts = await db.bank_accounts.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(100)
    return accounts

@api_router.post("/upi/send-money", response_model=Transaction)
async def send_money(transaction: TransactionCreate, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account:
            raise HTTPException(status_code=400, detail="No bank account linked")
        
        if account['balance'] < transaction.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Send money error: {str(e)}")
        raise HTTPException(status_code=500, detail="Transaction failed")

@api_router.post("/upi/request-money", response_model=MoneyRequest)
async def request_money(request: MoneyRequestCreate, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account:
            raise HTTPException(status_code=400, detail="No bank account linked")
        
        recipient_account = await db.bank_accounts.find_one({"upi_id": request.to_upi_id}, {"_id": 0})
        if not recipient_account:
            raise HTTPException(status_code=404, detail="UPI ID not found")
        
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Request money error: {str(e)}")
        raise HTTPException(status_code=500, detail="Request failed")

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
            raise HTTPException(status_code=404, detail="Request not found")
        
        if money_request['status'] != 'pending':
            raise HTTPException(status_code=400, detail="Request already processed")
        
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if account['balance'] < money_request['amount']:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Accept request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to accept request")

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
            raise HTTPException(status_code=400, detail="No bank account linked")
        
        if account['balance'] < bill.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Bill payment error: {str(e)}")
        raise HTTPException(status_code=500, detail="Bill payment failed")

@api_router.post("/upi/recharge")
async def mobile_recharge(recharge: RechargeRequest, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account:
            raise HTTPException(status_code=400, detail="No bank account linked")
        
        if account['balance'] < recharge.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Recharge error: {str(e)}")
        raise HTTPException(status_code=500, detail="Recharge failed")

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

@api_router.get("/groups/{group_id}/reports")
async def get_expense_reports(group_id: str, current_user: dict = Depends(verify_token)):
    try:
        group = await db.groups.find_one({"id": group_id, "members.id": current_user['user_id']}, {"_id": 0})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
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
        logging.error(f"Reports error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate reports")

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