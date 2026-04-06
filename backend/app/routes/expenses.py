import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.dependencies import verify_token
from app.models.expense import Expense, ExpenseCreate, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(verify_token)):
    # Verify the user is a member of the group
    group = await db.groups.find_one(
        {"id": expense_data.group_id, "members.id": current_user['user_id']}, {"_id": 0}
    )
    if not group:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a group member to create expenses"
        )

    # Validate split_details: every user_id must be a group member
    member_ids = {m['id'] for m in group['members']}
    for split in expense_data.split_details:
        if split.user_id not in member_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"split_details contains non-member user_id: {split.user_id}"
            )

    # Validate split amounts sum matches total_amount (within 1 cent)
    split_total = sum(s.amount for s in expense_data.split_details)
    if abs(split_total - expense_data.total_amount) > 0.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="split_details amounts do not sum to total_amount"
        )

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
        "created_at": datetime.now(UTC).isoformat()
    }

    await db.expenses.insert_one(expense_doc)

    await db.expense_logs.insert_one({
        "id": str(uuid.uuid4()),
        "expense_id": expense_id,
        "action": "added",
        "user_id": current_user['user_id'],
        "timestamp": datetime.now(UTC).isoformat()
    })

    return Expense(**expense_doc)

@router.get("/categories")
async def get_expense_categories(current_user: dict = Depends(verify_token)):
    return {
        "categories": [
            "Food & Dining", "Transportation", "Entertainment", "Shopping",
            "Groceries", "Utilities", "Healthcare", "Travel", "Other"
        ]
    }

@router.get("/{expense_id}", response_model=Expense)
async def get_expense(expense_id: str, current_user: dict = Depends(verify_token)):
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    group = await db.groups.find_one({"id": expense["group_id"], "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return expense

@router.put("/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, update_data: ExpenseUpdate, current_user: dict = Depends(verify_token)):
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

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
            "timestamp": datetime.now(UTC).isoformat()
        })
    updated = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    return updated

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: str, current_user: dict = Depends(verify_token)):
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    group = await db.groups.find_one({"id": expense["group_id"], "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only group members can delete this expense")

    await db.expense_logs.insert_one({
        "id": str(uuid.uuid4()),
        "expense_id": expense_id,
        "action": "deleted",
        "user_id": current_user['user_id'],
        "timestamp": datetime.now(UTC).isoformat()
    })
    await db.expenses.delete_one({"id": expense_id})
