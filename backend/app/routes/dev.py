import os

<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, status
=======
from fastapi import APIRouter, HTTPException, status
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)

from app.database import db
from app.dependencies import verify_token
from seed import seed_data

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

    await seed_data(db)
    return {"status": "success", "message": "Database reset and seeded with fresh fake data"}
