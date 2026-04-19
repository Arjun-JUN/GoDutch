import os

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.dependencies import verify_token

router = APIRouter(prefix="/dev", tags=["Dev"])

@router.post("/reset")
async def reset_db(current_user: dict = Depends(verify_token)):
    if os.getenv("ENV", "development") != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Reset not allowed in production"
        )

    await db.users.delete_many({})
    await db.groups.delete_many({})
    await db.expenses.delete_many({})
    await db.bank_accounts.delete_many({})
    await db.transactions.delete_many({})
    await db.money_requests.delete_many({})
    await db.payments.delete_many({})

    return {"status": "success", "message": "Database reset"}
