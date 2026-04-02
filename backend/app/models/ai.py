from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict

class OCRRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"

class OCRItem(BaseModel):
    name: str
    price: float
    quantity: int

class OCRResult(BaseModel):
    merchant: str
    date: str
    total_amount: float
    items: List[OCRItem]

class SmartSplitRequest(BaseModel):
    group_id: str
    instruction: str
    expense_context: Optional[Dict] = None

class SmartSplitResponse(BaseModel):
    split_plan: Dict
    clarification_needed: bool = False
    clarification_question: Optional[str] = None
