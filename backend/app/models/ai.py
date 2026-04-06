
from pydantic import BaseModel, Field


class OCRRequest(BaseModel):
    image_base64: str = Field(..., max_length=10_000_000)  # ~7.5 MB decoded
    mime_type: str = Field(default="image/jpeg", pattern=r"^image/(jpeg|png|webp|heic)$")

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
    instruction: str = Field(..., min_length=1, max_length=2000)
    expense_context: dict | None = None

class SmartSplitResponse(BaseModel):
    split_plan: dict
    clarification_needed: bool = False
    clarification_question: str | None = None
