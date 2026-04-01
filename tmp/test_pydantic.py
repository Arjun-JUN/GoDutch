from pydantic import BaseModel
from typing import List

class OCRItem(BaseModel):
    name: str
    price: float
    quantity: int = 1

class OCRResult(BaseModel):
    merchant: str
    date: str
    total_amount: float
    items: List[OCRItem]

data = {
    "merchant": "Test",
    "date": "2024-01-01",
    "total_amount": 290.0,
    "items": [
        {"name": "Ghee Rice", "price": 90.0},
        {"name": "Beef Fry", "price": 100.0, "quantity": 2}
    ]
}

result = OCRResult.model_validate(data)
print(result.model_dump_json(indent=2))
