"""
Unit tests for Pydantic models.
Validates field constraints, defaults, and validators without touching HTTP or DB.
"""
import pytest
from pydantic import ValidationError

from app.models.auth import UserRegister, UserLogin
from app.models.group import GroupCreate
from app.models.expense import ExpenseCreate, ExpenseItem, SplitDetail
from app.models.upi import BankAccountCreate, TransactionCreate, MoneyRequestCreate, BillPayment, RechargeRequest
from app.models.ai import OCRRequest, SmartSplitRequest


class TestUserRegister:
    def test_valid(self):
        u = UserRegister(email="user@example.com", password="secret", name="Alice")
        assert u.email == "user@example.com"
        assert u.name == "Alice"

    def test_invalid_email_raises(self):
        with pytest.raises(ValidationError):
            UserRegister(email="not-an-email", password="secret", name="Alice")

    def test_missing_name_raises(self):
        with pytest.raises(ValidationError):
            UserRegister(email="user@example.com", password="secret")

    def test_missing_password_raises(self):
        with pytest.raises(ValidationError):
            UserRegister(email="user@example.com", name="Alice")


class TestUserLogin:
    def test_valid(self):
        u = UserLogin(email="user@example.com", password="secret")
        assert u.password == "secret"

    def test_invalid_email_raises(self):
        with pytest.raises(ValidationError):
            UserLogin(email="bad-email", password="secret")


class TestGroupCreate:
    def test_valid(self):
        g = GroupCreate(name="Trip", member_emails=["a@x.com", "b@x.com"])
        assert g.name == "Trip"
        assert len(g.member_emails) == 2

    def test_empty_members_allowed(self):
        g = GroupCreate(name="Solo", member_emails=[])
        assert g.member_emails == []

    def test_missing_name_raises(self):
        with pytest.raises(ValidationError):
            GroupCreate(member_emails=["a@x.com"])


class TestExpenseItem:
    def test_valid_with_defaults(self):
        item = ExpenseItem(name="Pizza", price=12.5)
        assert item.category == "Other"
        assert item.assigned_to == []

    def test_category_can_be_set(self):
        item = ExpenseItem(name="Taxi", price=8.0, category="Transportation")
        assert item.category == "Transportation"

    def test_price_missing_raises(self):
        with pytest.raises(ValidationError):
            ExpenseItem(name="Item")


class TestSplitDetail:
    def test_valid(self):
        sd = SplitDetail(user_id="uid-1", user_name="Alice", amount=25.0)
        assert sd.amount == 25.0

    def test_missing_fields_raise(self):
        with pytest.raises(ValidationError):
            SplitDetail(user_id="uid-1")


class TestExpenseCreate:
    def _base(self):
        return dict(
            group_id="grp-1",
            merchant="Cafe",
            date="2024-03-01",
            total_amount=50.0,
            items=[{"name": "Coffee", "price": 50.0}],
            split_type="equal",
            split_details=[{"user_id": "u1", "user_name": "Alice", "amount": 50.0}],
        )

    def test_valid(self):
        e = ExpenseCreate(**self._base())
        assert e.category == "Food & Dining"
        assert e.receipt_image is None
        assert e.notes is None

    def test_optional_fields(self):
        data = self._base()
        data["receipt_image"] = "base64string"
        data["notes"] = "team lunch"
        e = ExpenseCreate(**data)
        assert e.notes == "team lunch"

    def test_missing_merchant_raises(self):
        data = self._base()
        del data["merchant"]
        with pytest.raises(ValidationError):
            ExpenseCreate(**data)


class TestBankAccountCreate:
    def test_valid(self):
        b = BankAccountCreate(
            bank_name="HDFC",
            account_number="1234567890",
            ifsc_code="HDFC0001234",
            account_holder="Alice",
            upi_id="alice@upi",
        )
        assert b.upi_id == "alice@upi"

    def test_missing_field_raises(self):
        with pytest.raises(ValidationError):
            BankAccountCreate(bank_name="HDFC", account_number="123")


class TestTransactionCreate:
    def test_valid_defaults(self):
        t = TransactionCreate(to_upi_id="bob@upi", amount=100.0)
        assert t.transaction_type == "payment"
        assert t.note is None

    def test_custom_type(self):
        t = TransactionCreate(to_upi_id="bob@upi", amount=50.0, transaction_type="request")
        assert t.transaction_type == "request"


class TestMoneyRequestCreate:
    def test_valid(self):
        m = MoneyRequestCreate(to_upi_id="bob@upi", amount=200.0, note="rent share")
        assert m.note == "rent share"

    def test_note_optional(self):
        m = MoneyRequestCreate(to_upi_id="bob@upi", amount=50.0)
        assert m.note is None


class TestOCRRequest:
    def test_valid(self):
        r = OCRRequest(image_base64="abc123")
        assert r.mime_type == "image/jpeg"

    def test_custom_mime_type(self):
        r = OCRRequest(image_base64="abc123", mime_type="image/png")
        assert r.mime_type == "image/png"

    def test_missing_image_raises(self):
        with pytest.raises(ValidationError):
            OCRRequest()


class TestBillPayment:
    def test_valid(self):
        b = BillPayment(
            biller_name="Electricity Board",
            bill_number="EB123",
            amount=500.0,
            category="Utilities",
        )
        assert b.category == "Utilities"


class TestRechargeRequest:
    def test_valid(self):
        r = RechargeRequest(
            mobile_number="9876543210",
            operator="Airtel",
            amount=299.0,
            recharge_type="prepaid",
        )
        assert r.operator == "Airtel"
