import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

VALID_SPLIT_TYPES = Literal["equal", "custom", "item-based"]
VALID_CATEGORIES = Literal[
    "Food & Dining", "Transportation", "Entertainment", "Shopping",
    "Groceries", "Utilities", "Healthcare", "Travel", "Other"
]

class ExpenseItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., ge=0)
    quantity: int = Field(1, gt=0, le=10_000)
    category: str = "Other"
    assigned_to: list[str] = []

class SplitDetail(BaseModel):
    user_id: str
    user_name: str = Field(..., max_length=100)
    amount: float = Field(..., ge=0)

class ExpenseCreate(BaseModel):
    group_id: str
    merchant: str = Field(..., min_length=1, max_length=200)
    date: str
    total_amount: float = Field(..., gt=0, le=10_000_000)
    items: list[ExpenseItem] = Field(..., min_length=1)
    split_type: VALID_SPLIT_TYPES
    split_details: list[SplitDetail] = Field(..., min_length=1)
    receipt_image: str | None = Field(default=None, max_length=2_000_000)
    category: VALID_CATEGORIES = "Food & Dining"
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        if v and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError("date must be in YYYY-MM-DD format")
        return v

class Expense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    group_id: str
    created_by: str
    merchant: str
    date: str
    total_amount: float
    items: list[ExpenseItem]
    split_type: str
    split_details: list[SplitDetail]
    receipt_image: str | None = None
    category: str = "Food & Dining"
    notes: str | None = None
    created_at: str

class ExpenseUpdate(BaseModel):
    merchant: str | None = Field(default=None, max_length=200)
    date: str | None = None
    total_amount: float | None = None
    items: list[ExpenseItem] | None = None
    split_type: VALID_SPLIT_TYPES | None = None
    split_details: list[SplitDetail] | None = None
    category: VALID_CATEGORIES | None = None
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str | None) -> str | None:
        if v and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError("date must be in YYYY-MM-DD format")
        return v
