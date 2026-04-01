"""
Unit tests for pure helper functions in backend/server.py.
These tests require no database or HTTP stack.
"""
import pytest
from backend.server import _extract_json_block


class TestExtractJsonBlock:
    def test_plain_json_object(self):
        raw = '{"merchant": "Pizza Place", "total_amount": 25.0}'
        result = _extract_json_block(raw)
        assert result["merchant"] == "Pizza Place"
        assert result["total_amount"] == 25.0

    def test_json_embedded_in_text(self):
        raw = 'Here is the result: {"key": "value", "num": 42} end of text'
        result = _extract_json_block(raw)
        assert result["key"] == "value"
        assert result["num"] == 42

    def test_json_with_leading_trailing_whitespace(self):
        raw = '   \n  {"a": 1}  \n  '
        result = _extract_json_block(raw)
        assert result["a"] == 1

    def test_json_with_nested_objects(self):
        raw = '{"items": [{"name": "Coffee", "price": 3.5}], "total": 3.5}'
        result = _extract_json_block(raw)
        assert len(result["items"]) == 1
        assert result["items"][0]["name"] == "Coffee"

    def test_json_with_null_values(self):
        raw = '{"merchant": "Store", "date": null, "total_amount": 10.0, "items": []}'
        result = _extract_json_block(raw)
        assert result["date"] is None

    def test_invalid_json_raises(self):
        with pytest.raises(Exception):
            _extract_json_block("this is not json at all")

    def test_empty_string_raises(self):
        with pytest.raises(Exception):
            _extract_json_block("")

    def test_json_array_at_top_level(self):
        """Arrays don't contain curly braces at root; only objects are extracted."""
        raw = '[1, 2, 3]'
        # list is valid JSON but _extract_json_block tries json.loads first,
        # so it should succeed and return the list
        result = _extract_json_block(raw)
        assert result == [1, 2, 3]

    def test_markdown_code_fence_stripped(self):
        """Gemini sometimes wraps output in triple-backtick fences."""
        raw = '```json\n{"total_amount": 99.9}\n```'
        # json.loads will fail; then curly-brace extraction picks up the object
        result = _extract_json_block(raw)
        assert result["total_amount"] == 99.9
