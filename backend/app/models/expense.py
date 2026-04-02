from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class ExpenseItem(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    quantity: int = Field(1, gt=0)
    category: str = "Other"
    assigned_to: List[str] = []

class SplitDetail(BaseModel):
    user_id: str
    user_name: str
    amount: float = Field(..., ge=0)

class ExpenseCreate(BaseModel):
    group_id: str
    merchant: str = Field(..., min_length=1)
    date: str
    total_amount: float = Field(..., gt=0)
    items: List[ExpenseItem]
    split_type: str
    split_details: List[SplitDetail]
    receipt_image: Optional[str] = None
    category: str = "Food & Dining"
    notes: Optional[str] = None

class Expense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    group_id: str
    created_by: str
    merchant: str
    date: str
    total_amount: float
    items: List[ExpenseItem]
    split_type: str
    split_details: List[SplitDetail]
    receipt_image: Optional[str] = None
    category: str = "Food & Dining"
    notes: Optional[str] = None
    created_at: str

class ExpenseUpdate(BaseModel):
    merchant: Optional[str] = None
    date: Optional[str] = None
    total_amount: Optional[float] = None
    items: Optional[List[ExpenseItem]] = None
    split_type: Optional[str] = None
    split_details: Optional[List[SplitDetail]] = None
    category: Optional[str] = None
    notes: Optional[str] = None
