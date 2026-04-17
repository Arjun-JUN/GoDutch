# backend/app/models

> Pydantic schemas that define the data contract for every request, response, and MongoDB document in the application.

## Overview

Every piece of data that enters or leaves the API is typed here. FastAPI uses these models for two things: automatic request body deserialization (with validation) and automatic response JSON serialization. They also serve as live documentation — reading a model file tells you exactly what a client must send and what it will receive.

Models are grouped by domain to mirror the `routes/` structure. There is intentional duplication between "request" models (what clients send) and "response" models (what the API returns) — this keeps the API contract stable even as internal document shapes evolve.

## How it works

1. A route handler declares a request model as a parameter: `expense: ExpenseCreate`.
2. FastAPI deserializes the incoming JSON and validates it. Invalid data raises 422 before the handler body runs.
3. The handler may instantiate a document model (e.g. `ExpenseDocument`) to write to MongoDB.
4. The response is declared as `response_model=ExpenseResponse`; FastAPI strips extra fields before serializing.

## Key files

| File | Key models |
|------|-----------|
| `auth.py` | `UserCreate`, `UserLogin`, `UserResponse`, `Token` |
| `expense.py` | `ExpenseItem`, `ExpenseCreate`, `ExpenseUpdate`, `ExpenseResponse`, `SplitDetail` |
| `group.py` | `GroupCreate`, `GroupResponse`, `GroupMember` |
| `settlements.py` | `Settlement`, `SettlementsResponse` |
| `upi.py` | `BankAccountCreate`, `Transaction`, `MoneyRequest`, `SendMoneyRequest` |
| `ai.py` | `OCRResult`, `SmartSplitRequest`, `SmartSplitResponse` |

## Inputs & Outputs

**Takes in:** Raw Python dicts from JSON deserialization or MongoDB documents.
**Emits:** Validated Python objects; serializable dicts for JSON responses.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `routes/` | Import and instantiate models for validation |
| Upstream | `utils/ai_helpers.py` | Returns `OCRResult` and `SmartSplitResponse` |
| Downstream | MongoDB | Documents inserted as model `.dict()` |

## Gotchas

- MongoDB documents include a `_id` field (BSON ObjectId) that Pydantic doesn't serialize cleanly. Routes typically convert `_id` to a string `id` field manually before returning.
- `SplitDetail` carries both `user_id` and `user_name` — the name is denormalized for display without a join. Keep them in sync when users update their name.

## Further reading

- [routes/](../routes/README.md) — consumers of these models
