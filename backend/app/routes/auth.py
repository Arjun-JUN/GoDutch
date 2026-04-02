import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, status

from app.database import db
from app.dependencies import JWT_SECRET
from app.models.auth import TokenResponse, User, UserLogin, UserRegister

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    password_hash = bcrypt.hashpw(
        user_data.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": password_hash,
        "name": user_data.name,
        "created_at": datetime.now(UTC).isoformat()
    }

    await db.users.insert_one(user_doc)

    token = jwt.encode(
        {
            "user_id": user_id,
            "email": user_data.email,
            "exp": datetime.now(UTC) + timedelta(days=30)
        },
        JWT_SECRET,
        algorithm='HS256'
    )

    user = User(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        created_at=user_doc["created_at"]
    )
    return TokenResponse(token=token, user=user)

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not bcrypt.checkpw(
        credentials.password.encode('utf-8'),
        user_doc['password_hash'].encode('utf-8')
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = jwt.encode(
        {
            "user_id": user_doc['id'],
            "email": user_doc['email'],
            "exp": datetime.now(UTC) + timedelta(days=30)
        },
        JWT_SECRET,
        algorithm='HS256'
    )

    user = User(
        id=user_doc['id'],
        email=user_doc['email'],
        name=user_doc['name'],
        created_at=user_doc['created_at']
    )
    return TokenResponse(token=token, user=user)
