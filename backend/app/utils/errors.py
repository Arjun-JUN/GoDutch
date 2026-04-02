import logging

from fastapi import HTTPException, status


def handle_server_error(e: Exception, context: str, default_detail: str):
    if isinstance(e, HTTPException):
        raise e

    error_msg = str(e)
    logging.error(f"{context} error: {error_msg}")

    # Handle quota/billing-specific AI errors
    if "budget" in error_msg.lower() or "exceeded" in error_msg.lower():
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Upstream AI service is temporarily unavailable due to quota or billing limits."
        )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=default_detail if not error_msg else f"{default_detail}: {error_msg}"
    )
