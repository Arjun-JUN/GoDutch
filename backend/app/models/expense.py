import re

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ExpenseItem(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    quantity: int = Field(1, gt=0)
    category: str = "Other"
    assigned_to: list[str] = []

class SplitDetail(BaseModel):
    user_id: str
    user_name: str
    amount: float = Field(..., ge=0)

class ExpenseCreate(BaseModel):
    group_id: str
    merchant: str = Field(..., min_length=1)
    date: str
    total_amount: float = Field(..., gt=0, le=10_000_000)

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        if v and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError("date must be in YYYY-MM-DD format")
        return v
    items: list[ExpenseItem]
    split_type: str
    split_details: list[SplitDetail]
    receipt_image: str | None = None
    category: str = "Food & Dining"
    notes: str | None = None

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
    merchant: str | None = None
    date: str | None = None
    total_amount: float | None = None
    items: list[ExpenseItem] | None = None
    split_type: str | None = None
    split_details: list[SplitDetail] | None = None
    category: str | None = None
    notes: str | None = None
