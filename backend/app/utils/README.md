# backend/app/utils

> Shared utility functions: Gemini AI integration (OCR + smart split) and a centralized error helper.

## Overview

Two utilities that don't belong cleanly to any single route: the AI helpers that talk to Gemini, and the error formatting function used across all routes. Keeping them here avoids duplicating Gemini client initialization and error-handling boilerplate across every route file.

## How it works

**OCR (`ai_helpers.py`):**
1. Route receives a base64-encoded receipt image.
2. `scan_receipt(image_b64)` initializes the `google-generativeai` client, sends the image with a structured extraction prompt, and parses the JSON response.
3. Returns an `OCRResult` with merchant, date, total_amount, and line items (name, price, quantity).

**Smart split (`ai_helpers.py`):**
1. Route receives a natural-language instruction and group member context.
2. `smart_split(instruction, expense_context)` sends both to Gemini with a prompt that asks for a structured split plan.
3. If the instruction is ambiguous, Gemini returns a `clarification_question` instead of a plan.
4. Returns `SmartSplitResponse`.

## Key files

| File | What it does |
|------|-------------|
| `ai_helpers.py` | `scan_receipt()` and `smart_split()` — Gemini API wrappers |
| `errors.py` | `http_error(status, detail)` — consistent HTTPException factory |

## Inputs & Outputs

**Takes in:** Base64 image strings; natural-language strings + group context dicts.
**Emits:** `OCRResult` and `SmartSplitResponse` Pydantic objects; `HTTPException` for error paths.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `routes/ai.py` | Direct function calls |
| Downstream | Gemini API | `google-generativeai` SDK |
| Downstream | `models/ai.py` | Returns typed model instances |

## Gotchas

- Gemini responses are parsed from JSON embedded in the model's text output — this is fragile if the model changes its formatting. The parsing code should be hardened with a retry or fallback.
- `GEMINI_API_KEY` must be in the environment; missing it raises at import time, not at call time.

## Further reading

- [routes/](../routes/README.md) — callers
- [models/ai.py](../models/README.md) — return types
