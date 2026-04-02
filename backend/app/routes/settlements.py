
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.dependencies import verify_token
from app.models.settlements import SettlementItem
from app.utils.errors import handle_server_error

router = APIRouter(prefix="/groups", tags=["Settlements"])

@router.get("/{group_id}/settlements", response_model=list[SettlementItem])
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

@router.get("/{group_id}/reports")
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
