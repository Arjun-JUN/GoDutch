import pytest
import json
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from pydantic import BaseModel
from backend.app.utils.ai_helpers import _extract_json_block, generate_structured_content

class MockResponseModel(BaseModel):
    name: str
    items: list[str]

def test_extract_json_block_simple():
    text = '{"name": "Test", "items": ["a", "b"]}'
    result = _extract_json_block(text)
    assert result == {"name": "Test", "items": ["a", "b"]}

def test_extract_json_block_with_markdown():
    text = '```json\n{"name": "Test", "items": ["a", "b"]}\n```'
    result = _extract_json_block(text)
    assert result == {"name": "Test", "items": ["a", "b"]}

def test_extract_json_block_with_noise():
    text = 'Here is the data: {"name": "Test", "items": ["a", "b"]} hope it helps!'
    result = _extract_json_block(text)
    assert result == {"name": "Test", "items": ["a", "b"]}

def test_extract_json_block_invalid():
    with pytest.raises(json.JSONDecodeError):
        _extract_json_block("not a json")

@pytest.mark.asyncio
@patch("backend.app.utils.ai_helpers.requests.Session")
@patch("backend.app.utils.ai_helpers.GEMINI_API_KEY", "test-key")
async def test_generate_structured_content_success(mock_session_class):
    mock_session = mock_session_class.return_value.__enter__.return_value
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": '{"name": "Mock", "items": ["item1"]}'}
                    ]
                }
            }
        ]
    }
    mock_session.post.return_value = mock_response

    result = await generate_structured_content([], MockResponseModel)
    
    assert result.name == "Mock"
    assert result.items == ["item1"]

@pytest.mark.asyncio
@patch("backend.app.utils.ai_helpers.GEMINI_API_KEY", "")
async def test_generate_structured_content_no_key():
    with pytest.raises(HTTPException) as excinfo:
        await generate_structured_content([], MockResponseModel)
    assert excinfo.value.status_code == 503
    assert "Gemini API key not configured" in excinfo.value.detail
