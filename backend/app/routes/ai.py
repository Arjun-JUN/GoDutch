import base64
import binascii

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db
from app.dependencies import verify_token
from app.models.ai import OCRRequest, OCRResult, SmartSplitRequest, SmartSplitResponse
from app.utils.ai_helpers import generate_structured_content
from app.utils.errors import handle_server_error

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/ocr/scan", response_model=OCRResult)
async def scan_receipt(request: OCRRequest, current_user: dict = Depends(verify_token)):
    try:
        base64.b64decode(request.image_base64, validate=True)

        result = await generate_structured_content(
            parts=[
                {
                    "text": (
                        "You extract structured data from receipt images.\n"
                        "Return valid JSON only with this shape:\n"
                        "{"
                        "\"merchant\": string, "
                        "\"date\": \"YYYY-MM-DD\", \"total_amount\": number, "
                        "\"items\": [{\"name\": string, \"price\": number, \"quantity\": number}]"
                        "}\n"
                        "Instructions:\n"
                        "1. Every item MUST have a 'name', 'price', and 'quantity'.\n"
                        "2. If an item has a quantity (e.g., '2x Burger' or '3 Beer'), extract it and use the UNIT price (price per item) in the 'price' field.\n"
                        "3. If quantity is NOT mentioned on the receipt, you MUST explicitly set it to 1.\n"
                        "4. Ensure 'total_amount' is the sum of (price * quantity) for all items.\n"
                        "5. If an exact item list is not visible, return the best available items.\n"
                        "6. If the date is unclear, use an empty string."
                    )
                },
                {
                    "inlineData": {
                        "mimeType": request.mime_type,
                        "data": request.image_base64,
                    }
                },
            ],
            response_model=OCRResult,
        )

        return result
    except binascii.Error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid receipt image data.") from None
    except Exception as e:
        handle_server_error(e, "OCR", "OCR scanning failed. Please try again or enter details manually.")

@router.post("/smart-split", response_model=SmartSplitResponse)
async def smart_split(request: SmartSplitRequest, current_user: dict = Depends(verify_token)):
    try:
        group = await db.groups.find_one(
            {"id": request.group_id, "members.id": current_user['user_id']}, {"_id": 0}
        )
        if not group:
<<<<<<< HEAD
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or access denied")
=======
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)

        members_info = ", ".join([f"{m['name']} (id: {m['id']})" for m in group['members']])
        context = f"Expense context: {request.expense_context}" if request.expense_context else ""

        result = await generate_structured_content(
            parts=[
                {
                    "text": (
                        "You are an intelligent expense splitting assistant. "
                        "Create precise split plans using only the provided group member ids. "
                        "If the instruction is ambiguous, set clarification_needed to true and ask one concise question.\n\n"
                        "Return valid JSON only with this shape:\n"
                        "{"
                        "\"split_plan\": {"
                        "\"items\": [{\"name\": string, \"price\": number, \"quantity\": number, \"category\": string, \"assigned_to\": [string]}], "
                        "\"split_type\": \"custom|equal|item-based\""
                        "}, "
                        "\"clarification_needed\": boolean, "
                        "\"clarification_question\": string | null"
                        "}\n\n"
                        "Group members: "
                        f"{members_info}\n\n"
                        f"Instruction: {request.instruction}\n"
                        f"{context}"
                    )
                }
            ],
            response_model=SmartSplitResponse,
        )

        return result
    except Exception as e:
        handle_server_error(e, "Smart Split", "Smart split failed")
