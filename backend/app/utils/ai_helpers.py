import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import HTTPException, status
from starlette.concurrency import run_in_threadpool

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / '.env')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

def _extract_json_block(text: str):
    stripped = text.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        start = stripped.find("{")
        end = stripped.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(stripped[start : end + 1])
        raise

async def generate_structured_content(parts, response_model):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured."
        )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
        },
    }

    def _send_request():
        with requests.Session() as session:
            session.trust_env = False
            response = session.post(url, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()

    try:
        response_json = await run_in_threadpool(_send_request)
    except requests.HTTPError as exc:
        response = exc.response
        detail = "Upstream AI request failed."

        if response is not None:
            try:
                error_payload = response.json()
                detail = error_payload.get("error", {}).get("message") or detail
            except ValueError:
                detail = response.text or detail

            raise HTTPException(status_code=response.status_code, detail=detail) from exc

        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail) from exc

    candidates = response_json.get("candidates") or []
    if not candidates:
        raise ValueError(f"Gemini returned no candidates: {response_json}")

    part_list = candidates[0].get("content", {}).get("parts", [])
    text = "".join(part.get("text", "") for part in part_list if isinstance(part, dict))
    if not text:
        raise ValueError(f"Gemini returned no text: {response_json}")

    parsed = _extract_json_block(text)
    return response_model.model_validate(parsed)
