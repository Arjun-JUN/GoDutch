
<<<<<<< HEAD
from pydantic import BaseModel, ConfigDict, Field, field_serializer
=======
from pydantic import BaseModel, ConfigDict, Field
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)


class UPIPaymentRequest(BaseModel):
    upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")
    amount: float = Field(..., gt=0, le=1_000_000)
    settlement_id: str
<<<<<<< HEAD
    note: str | None = Field(default=None, max_length=200)
=======
    note: str | None = None
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)

class BankAccount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    bank_name: str
    account_number: str
    ifsc_code: str
    account_holder: str
    upi_id: str
    balance: float
    is_primary: bool
    created_at: str

    @field_serializer("account_number")
    def mask_account_number(self, v: str) -> str:
        if len(v) <= 4:
            return "****"
        return "*" * (len(v) - 4) + v[-4:]

    @field_serializer("ifsc_code")
    def mask_ifsc_code(self, v: str) -> str:
        # Expose only the bank identifier (first 4 chars); mask branch code
        if len(v) <= 4:
            return v
        return v[:4] + "*" * (len(v) - 4)

class BankAccountCreate(BaseModel):
    bank_name: str = Field(..., min_length=2)
    account_number: str = Field(..., min_length=8)
    ifsc_code: str = Field(..., pattern=r"^[A-Z]{4}0[A-Z0-9]{6}$")
    account_holder: str = Field(..., min_length=2)
    upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    from_user_id: str
    from_upi_id: str
    to_user_id: str | None = None
    to_upi_id: str
    amount: float
    transaction_type: str
    status: str
    note: str | None = None
    reference_id: str
    created_at: str

class TransactionCreate(BaseModel):
    to_upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")
    amount: float = Field(..., gt=0, le=1_000_000)
    transaction_type: str = "payment"
    note: str | None = None

class MoneyRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    from_user_id: str
    from_upi_id: str
    to_user_id: str
    to_upi_id: str
    amount: float
    note: str | None = None
    status: str
    created_at: str

class MoneyRequestCreate(BaseModel):
    to_upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")
<<<<<<< HEAD
    amount: float = Field(..., gt=0, le=1_000_000)
=======
    amount: float = Field(..., gt=0)
>>>>>>> 0ca7015 (fix: resolve CI linting errors across frontend and backend)
    note: str | None = None

class BillPayment(BaseModel):
    biller_name: str = Field(..., min_length=2)
    bill_number: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0, le=1_000_000)
    category: str

class RechargeRequest(BaseModel):
    mobile_number: str = Field(..., pattern=r"^\d{10}$")
    operator: str = Field(..., min_length=2)
    amount: float = Field(..., gt=0, le=100_000)
    recharge_type: str
