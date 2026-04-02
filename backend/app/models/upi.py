
from pydantic import BaseModel, ConfigDict, Field


class UPIPaymentRequest(BaseModel):
    upi_id: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+$")
    amount: float = Field(..., gt=0)
    settlement_id: str
    note: str | None = None

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
    amount: float = Field(..., gt=0)
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
    amount: float = Field(..., gt=0)
    note: str | None = None

class BillPayment(BaseModel):
    biller_name: str = Field(..., min_length=2)
    bill_number: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    category: str

class RechargeRequest(BaseModel):
    mobile_number: str = Field(..., pattern=r"^\d{10}$")
    operator: str = Field(..., min_length=2)
    amount: float = Field(..., gt=0)
    recharge_type: str
