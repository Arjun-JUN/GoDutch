import logging
import uuid
from datetime import UTC, datetime, timedelta

import bcrypt

logger = logging.getLogger(__name__)

async def seed_data(db):
    user_count = await db.users.count_documents({})
    if user_count > 0:
        logger.info("Database already has data, skipping seed.")
        return

    logger.info("Seeding database with fake data...")

    # 1. Create Users
    password = "password123"
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    users_data = [
        {"id": str(uuid.uuid4()), "email": "arjun@example.com", "name": "Arjun", "password_hash": password_hash},
        {"id": str(uuid.uuid4()), "email": "sarah@example.com", "name": "Sarah", "password_hash": password_hash},
        {"id": str(uuid.uuid4()), "email": "rahul@example.com", "name": "Rahul", "password_hash": password_hash},
        {"id": str(uuid.uuid4()), "email": "mike@example.com", "name": "Mike", "password_hash": password_hash},
    ]

    for u in users_data:
        u["created_at"] = datetime.now(UTC).isoformat()

    await db.users.insert_many(users_data)

    # Map names to IDs for easier reference
    u_map = {u["name"]: u["id"] for u in users_data}
    u_email_map = {u["name"]: u["email"] for u in users_data}

    # 2. Create Groups
    groups_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Weekend Trip - Goa",
            "members": [
                {"id": u_map["Arjun"], "email": u_email_map["Arjun"], "name": "Arjun"},
                {"id": u_map["Sarah"], "email": u_email_map["Sarah"], "name": "Sarah"},
                {"id": u_map["Rahul"], "email": u_email_map["Rahul"], "name": "Rahul"},
                {"id": u_map["Mike"], "email": u_email_map["Mike"], "name": "Mike"},
            ],
            "created_by": u_map["Arjun"],
            "currency": "INR",
            "created_at": (datetime.now(UTC) - timedelta(days=10)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Flatmates - Koramangala",
            "members": [
                {"id": u_map["Arjun"], "email": u_email_map["Arjun"], "name": "Arjun"},
                {"id": u_map["Sarah"], "email": u_email_map["Sarah"], "name": "Sarah"},
            ],
            "created_by": u_map["Sarah"],
            "currency": "INR",
            "created_at": (datetime.now(UTC) - timedelta(days=30)).isoformat()
        }
    ]

    await db.groups.insert_many(groups_data)

    g_goa = groups_data[0]["id"]
    g_flat = groups_data[1]["id"]

    # 3. Create Expenses
    expenses_data = [
        # Goa Trip Expenses
        {
            "id": str(uuid.uuid4()),
            "group_id": g_goa,
            "created_by": u_map["Arjun"],
            "merchant": "Indigo Airlines",
            "date": (datetime.now(UTC) - timedelta(days=9)).strftime("%Y-%m-%d"),
            "total_amount": 12000.0,
            "category": "Travel",
            "items": [{"name": "Flight Tickets", "price": 12000.0, "category": "Travel", "assigned_to": []}],
            "split_type": "equal",
            "split_details": [
                {"user_id": u_map["Arjun"], "user_name": "Arjun", "amount": 3000.0},
                {"user_id": u_map["Sarah"], "user_name": "Sarah", "amount": 3000.0},
                {"user_id": u_map["Rahul"], "user_name": "Rahul", "amount": 3000.0},
                {"user_id": u_map["Mike"], "user_name": "Mike", "amount": 3000.0},
            ],
            "created_at": (datetime.now(UTC) - timedelta(days=9)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "group_id": g_goa,
            "created_by": u_map["Sarah"],
            "merchant": "Beach Shack - Curlies",
            "date": (datetime.now(UTC) - timedelta(days=8)).strftime("%Y-%m-%d"),
            "total_amount": 4500.0,
            "category": "Food & Dining",
            "items": [
                {"name": "Seafood Platter", "price": 2500.0, "category": "Food & Dining", "assigned_to": []},
                {"name": "Drinks", "price": 2000.0, "category": "Food & Dining", "assigned_to": []}
            ],
            "split_type": "equal",
            "split_details": [
                {"user_id": u_map["Arjun"], "user_name": "Arjun", "amount": 1125.0},
                {"user_id": u_map["Sarah"], "user_name": "Sarah", "amount": 1125.0},
                {"user_id": u_map["Rahul"], "user_name": "Rahul", "amount": 1125.0},
                {"user_id": u_map["Mike"], "user_name": "Mike", "amount": 1125.0},
            ],
            "created_at": (datetime.now(UTC) - timedelta(days=8)).isoformat()
        },
        # Flatmates Expenses
        {
            "id": str(uuid.uuid4()),
            "group_id": g_flat,
            "created_by": u_map["Sarah"],
            "merchant": "BigBasket",
            "date": (datetime.now(UTC) - timedelta(days=5)).strftime("%Y-%m-%d"),
            "total_amount": 2400.0,
            "category": "Groceries",
            "items": [{"name": "Monthly Groceries", "price": 2400.0, "category": "Groceries", "assigned_to": []}],
            "split_type": "equal",
            "split_details": [
                {"user_id": u_map["Arjun"], "user_name": "Arjun", "amount": 1200.0},
                {"user_id": u_map["Sarah"], "user_name": "Sarah", "amount": 1200.0},
            ],
            "created_at": (datetime.now(UTC) - timedelta(days=5)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "group_id": g_flat,
            "created_by": u_map["Arjun"],
            "merchant": "Bescom",
            "date": (datetime.now(UTC) - timedelta(days=2)).strftime("%Y-%m-%d"),
            "total_amount": 1800.0,
            "category": "Utilities",
            "items": [{"name": "Electricity Bill", "price": 1800.0, "category": "Utilities", "assigned_to": []}],
            "split_type": "equal",
            "split_details": [
                {"user_id": u_map["Arjun"], "user_name": "Arjun", "amount": 900.0},
                {"user_id": u_map["Sarah"], "user_name": "Sarah", "amount": 900.0},
            ],
            "created_at": (datetime.now(UTC) - timedelta(days=2)).isoformat()
        }
    ]

    await db.expenses.insert_many(expenses_data)

    # 4. Create Bank Accounts
    accounts_data = [
        {
            "id": str(uuid.uuid4()),
            "user_id": u_map["Arjun"],
            "bank_name": "HDFC Bank",
            "account_number": "XXXX-XXXX-1234",
            "ifsc_code": "HDFC0001234",
            "account_holder": "Arjun",
            "upi_id": "arjun@hdfc",
            "balance": 15000.0,
            "is_primary": True,
            "created_at": datetime.now(UTC).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": u_map["Sarah"],
            "bank_name": "ICICI Bank",
            "account_number": "XXXX-XXXX-5678",
            "ifsc_code": "ICIC0005678",
            "account_holder": "Sarah",
            "upi_id": "sarah@icici",
            "balance": 25000.0,
            "is_primary": True,
            "created_at": datetime.now(UTC).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": u_map["Rahul"],
            "bank_name": "SBI",
            "account_number": "XXXX-XXXX-9012",
            "ifsc_code": "SBIN0009012",
            "account_holder": "Rahul",
            "upi_id": "rahul@sbi",
            "balance": 8000.0,
            "is_primary": True,
            "created_at": datetime.now(UTC).isoformat()
        }
    ]

    await db.bank_accounts.insert_many(accounts_data)

    # 5. Create some dummy transactions
    transactions_data = [
        {
            "id": str(uuid.uuid4()),
            "from_user_id": u_map["Sarah"],
            "from_upi_id": "sarah@icici",
            "to_user_id": u_map["Arjun"],
            "to_upi_id": "arjun@hdfc",
            "amount": 500.0,
            "transaction_type": "payment",
            "status": "success",
            "note": "Lunch yesterday",
            "reference_id": f"UPI{uuid.uuid4().hex[:12].upper()}",
            "created_at": (datetime.now(UTC) - timedelta(hours=5)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "from_user_id": u_map["Arjun"],
            "from_upi_id": "arjun@hdfc",
            "to_user_id": None,
            "to_upi_id": "airtel@recharge",
            "amount": 499.0,
            "transaction_type": "recharge",
            "status": "success",
            "note": "Prepaid - 9876543210 - Airtel",
            "reference_id": f"RECH{uuid.uuid4().hex[:12].upper()}",
            "created_at": (datetime.now(UTC) - timedelta(days=1)).isoformat()
        }
    ]

    await db.transactions.insert_many(transactions_data)

    logger.info("Seeding complete!")
