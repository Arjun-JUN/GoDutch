import uuid
import os
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import db
from app.models.expense import Expense, ExpenseCreate, ExpenseUpdate
from app.dependencies import verify_token
from app.utils.errors import handle_server_error

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("", response_model=Expense)
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
            "timestamp": datetime.now(timezone.utc).isoformat()
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
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    await db.expenses.delete_one({"id": expense_id})
