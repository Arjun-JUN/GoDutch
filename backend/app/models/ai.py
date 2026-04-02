
<<<<<<< HEAD
from pydantic import BaseModel, Field
=======
from pydantic import BaseModel
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)


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
<<<<<<< HEAD
    instruction: str = Field(..., min_length=1, max_length=2000)
=======
    instruction: str
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)
    expense_context: dict | None = None

class SmartSplitResponse(BaseModel):
    split_plan: dict
    clarification_needed: bool = False
    clarification_question: str | None = None
