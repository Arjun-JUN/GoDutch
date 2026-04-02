
from pydantic import BaseModel


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
    items: list[OCRItem]

class SmartSplitRequest(BaseModel):
    group_id: str
    instruction: str
    expense_context: dict | None = None

class SmartSplitResponse(BaseModel):
    split_plan: dict
    clarification_needed: bool = False
    clarification_question: str | None = None
