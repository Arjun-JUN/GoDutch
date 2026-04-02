import uuid
from datetime import UTC, datetime
<<<<<<< HEAD
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query, status
=======

from fastapi import APIRouter, Depends, HTTPException, status
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)

from app.database import db
from app.dependencies import verify_token
from app.models.upi import (
    BankAccount,
    BankAccountCreate,
    BillPayment,
    MoneyRequest,
    MoneyRequestCreate,
    RechargeRequest,
    Transaction,
    TransactionCreate,
    UPIPaymentRequest,
)
from app.utils.errors import handle_server_error

router = APIRouter(prefix="/upi", tags=["UPI"])

@router.post("/initiate-payment")
async def initiate_upi_payment(payment: UPIPaymentRequest, current_user: dict = Depends(verify_token)):
    try:
        # Security check: Verify the settlement belongs to the current user
        if payment.settlement_id:
            settlement = await db.payments.find_one({"id": payment.settlement_id})
            if settlement and settlement.get("from_user") != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only initiate payments for your own debts"
                )

        payment_id = str(uuid.uuid4())
<<<<<<< HEAD
        upi_url = (
            f"upi://pay?pa={quote(payment.upi_id, safe='')}"
            f"&pn=goDutch"
            f"&am={payment.amount}"
            f"&cu=INR"
            f"&tn={quote(payment.note or 'Settlement', safe='')}"
        )
=======
        upi_url = f"upi://pay?pa={payment.upi_id}&pn=goDutch&am={payment.amount}&cu=INR&tn={payment.note or 'Settlement'}"
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)

        payment_doc = {
            "id": payment_id,
            "from_user": current_user['user_id'],
            "upi_id": payment.upi_id,
            "amount": payment.amount,
            "settlement_id": payment.settlement_id,
            "note": payment.note,
            "status": "initiated",
            "upi_url": upi_url,
            "created_at": datetime.now(UTC).isoformat()
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

@router.post("/accounts", response_model=BankAccount)
async def add_bank_account(account: BankAccountCreate, current_user: dict = Depends(verify_token)):
    try:
        existing = await db.bank_accounts.find_one(
            {"user_id": current_user['user_id'], "upi_id": account.upi_id},
            {"_id": 0}
        )
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
            "created_at": datetime.now(UTC).isoformat()
        }

        await db.bank_accounts.insert_one(account_doc)
        return BankAccount(**account_doc)
    except Exception as e:
        handle_server_error(e, "Add Account", "Failed to add account")

@router.get("/accounts", response_model=list[BankAccount])
async def get_bank_accounts(current_user: dict = Depends(verify_token)):
    accounts = await db.bank_accounts.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(100)
    return accounts

@router.post("/send-money", response_model=Transaction)
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
            "created_at": datetime.now(UTC).isoformat()
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

@router.post("/request-money", response_model=MoneyRequest)
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
            "created_at": datetime.now(UTC).isoformat()
        }

        await db.money_requests.insert_one(request_doc)
        return MoneyRequest(**request_doc)
    except Exception as e:
        handle_server_error(e, "Request Money", "Request failed")

@router.get("/requests", response_model=list[MoneyRequest])
async def get_money_requests(current_user: dict = Depends(verify_token)):
    requests_list = await db.money_requests.find(
        {"$or": [{"from_user_id": current_user['user_id']}, {"to_user_id": current_user['user_id']}]},
        {"_id": 0}
    ).to_list(100)
    return requests_list

@router.post("/requests/{request_id}/accept")
async def accept_money_request(request_id: str, current_user: dict = Depends(verify_token)):
    try:
        money_request = await db.money_requests.find_one({"id": request_id, "to_user_id": current_user['user_id']}, {"_id": 0})
        if not money_request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

        if money_request['status'] != 'pending':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")

        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account or account['balance'] < money_request['amount']:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")

        transaction_id = str(uuid.uuid4())
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
            "reference_id": f"UPI{uuid.uuid4().hex[:12].upper()}",
            "created_at": datetime.now(UTC).isoformat()
        }

        await db.transactions.insert_one(transaction_doc)
        await db.bank_accounts.update_one({"user_id": current_user['user_id'], "is_primary": True}, {"$inc": {"balance": -money_request['amount']}})
        await db.bank_accounts.update_one({"user_id": money_request['from_user_id'], "is_primary": True}, {"$inc": {"balance": money_request['amount']}})
        await db.money_requests.update_one({"id": request_id}, {"$set": {"status": "accepted"}})

        return {"status": "success", "transaction_id": transaction_id}
    except Exception as e:
        handle_server_error(e, "Accept Request", "Failed to accept request")

@router.get("/transactions", response_model=list[Transaction])
<<<<<<< HEAD
async def get_transactions(current_user: dict = Depends(verify_token), limit: int = Query(default=50, ge=1, le=200)):
=======
async def get_transactions(current_user: dict = Depends(verify_token), limit: int = 50):
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)
    transactions = await db.transactions.find(
        {"$or": [{"from_user_id": current_user['user_id']}, {"to_user_id": current_user['user_id']}]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return transactions

@router.post("/bill-payment")
async def pay_bill(bill: BillPayment, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account or account['balance'] < bill.amount:
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
            "created_at": datetime.now(UTC).isoformat()
        }

        await db.transactions.insert_one(transaction_doc)
        await db.bank_accounts.update_one({"id": account['id']}, {"$inc": {"balance": -bill.amount}})
        return {"status": "success", "transaction_id": transaction_id, "reference_id": reference_id}
    except Exception as e:
        handle_server_error(e, "Bill Payment", "Bill payment failed")

@router.post("/recharge")
async def mobile_recharge(recharge: RechargeRequest, current_user: dict = Depends(verify_token)):
    try:
        account = await db.bank_accounts.find_one({"user_id": current_user['user_id'], "is_primary": True}, {"_id": 0})
        if not account or account['balance'] < recharge.amount:
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
            "created_at": datetime.now(UTC).isoformat()
        }

        await db.transactions.insert_one(transaction_doc)
        await db.bank_accounts.update_one({"id": account['id']}, {"$inc": {"balance": -recharge.amount}})
        return {"status": "success", "transaction_id": transaction_id, "reference_id": reference_id}
    except Exception as e:
        handle_server_error(e, "Recharge", "Recharge failed")
