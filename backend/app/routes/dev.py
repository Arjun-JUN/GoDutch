import os
from fastapi import APIRouter, HTTPException, status
from app.database import db
from seed import seed_data

router = APIRouter(prefix="/dev", tags=["Dev"])

@router.post("/reset")
async def reset_db():
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
    
    await seed_data(db)
    return {"status": "success", "message": "Database reset and seeded with fresh fake data"}
