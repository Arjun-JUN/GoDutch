import json
import pytest
from pydantic import ValidationError
from server import OCRItem, OCRResult

def test_ocr_item_validation_success():
    data = {"name": "Burger", "price": 150.0, "quantity": 2}
    item = OCRItem.model_validate(data)
    assert item.name == "Burger"
    assert item.price == 150.0
    assert item.quantity == 2

def test_ocr_item_validation_missing_quantity():
    # If quantity is missing, it should fail validation because I removed the default
    data = {"name": "Burger", "price": 150.0}
    with pytest.raises(ValidationError):
        OCRItem.model_validate(data)

def test_ocr_result_validation_success():
    data = {
        "merchant": "Food Land",
        "date": "2024-03-20",
        "total_amount": 300.0,
        "items": [
            {"name": "Burger", "price": 100.0, "quantity": 2},
            {"name": "Drink", "price": 50.0, "quantity": 2}
        ]
    }
    result = OCRResult.model_validate(data)
    assert result.merchant == "Food Land"
    assert len(result.items) == 2
    assert result.items[0].quantity == 2
    assert result.items[1].quantity == 2

def test_ocr_result_validation_calc_sum():
    data = {
        "merchant": "Food Land",
        "date": "2024-03-20",
        "total_amount": 250.0,
        "items": [
            {"name": "Item 1", "price": 50.0, "quantity": 3}, # 150
            {"name": "Item 2", "price": 100.0, "quantity": 1} # 100
        ]
    }
    result = OCRResult.model_validate(data)
    total = sum(i.price * i.quantity for i in result.items)
    assert total == 250.0
    assert result.total_amount == 250.0
