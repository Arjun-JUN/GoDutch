import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.dependencies import verify_token
from app.models.expense import Expense
from app.models.group import Group, GroupCreate

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("", response_model=Group)
async def create_group(group_data: GroupCreate, current_user: dict = Depends(verify_token)):
    member_users = await db.users.find({"email": {"$in": group_data.member_emails}}, {"_id": 0}).to_list(100)

    current_user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not current_user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Current user not found")

    current_user_in_list = any(u['email'] == current_user_doc['email'] for u in member_users)

    if not current_user_in_list:
        member_users.append(current_user_doc)

    if len(member_users) < len(group_data.member_emails) + (0 if current_user_in_list else 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some member emails not found"
        )

    members = [{"id": u['id'], "email": u['email'], "name": u['name']} for u in member_users]

    group_id = str(uuid.uuid4())
    group_doc = {
        "id": group_id,
        "name": group_data.name,
        "members": members,
        "currency": group_data.currency,
        "created_by": current_user['user_id'],
        "created_at": datetime.now(UTC).isoformat()
    }

    await db.groups.insert_one(group_doc)

    return Group(**group_doc)

@router.get("", response_model=list[Group])
async def get_groups(current_user: dict = Depends(verify_token)):
    groups = await db.groups.find(
        {"members.id": current_user['user_id']},
        {"_id": 0}
    ).to_list(1000)
    return groups

@router.get("/{group_id}", response_model=Group)
async def get_group(group_id: str, current_user: dict = Depends(verify_token)):
    group = await db.groups.find_one({"id": group_id, "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or access denied")
    return Group(**group)

@router.get("/{group_id}/expenses", response_model=list[Expense])
async def get_group_expenses(group_id: str, current_user: dict = Depends(verify_token)):
    # Verify group membership first
    group = await db.groups.find_one({"id": group_id, "members.id": current_user['user_id']}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or access denied")

    # Get expenses for the group and sort by date descending
    expenses = await db.expenses.find({"group_id": group_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    return expenses
