"""
Integration tests for UPI / banking endpoints.

POST /api/upi/accounts
GET  /api/upi/accounts
POST /api/upi/send-money
POST /api/upi/request-money
GET  /api/upi/requests
POST /api/upi/requests/{id}/accept
GET  /api/upi/transactions
POST /api/upi/initiate-payment
POST /api/upi/bill-payment
POST /api/upi/recharge
"""
import pytest


def _bank_payload(upi_id="alice@upi"):
    return {
        "bank_name": "HDFC Bank",
        "account_number": "1234567890",
        "ifsc_code": "HDFC0001234",
        "account_holder": "Alice",
        "upi_id": upi_id,
    }


class TestBankAccounts:
    async def test_add_bank_account_success(self, client, registered_user):
        resp = await client.post(
            "/api/upi/accounts",
            json=_bank_payload(),
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["upi_id"] == "alice@upi"
        assert data["bank_name"] == "HDFC Bank"
        assert data["balance"] == 10000.0
        assert data["is_primary"] is True
        assert "id" in data

    async def test_add_second_account_not_primary(self, client, registered_user):
        await client.post(
            "/api/upi/accounts", json=_bank_payload("alice@upi"), headers=registered_user["headers"]
        )
        resp = await client.post(
            "/api/upi/accounts",
            json=_bank_payload("alice2@upi"),
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["is_primary"] is False

    async def test_add_duplicate_upi_id_returns_400(self, client, registered_user):
        payload = _bank_payload()
        await client.post(
            "/api/upi/accounts", json=payload, headers=registered_user["headers"]
        )
        resp = await client.post(
            "/api/upi/accounts", json=payload, headers=registered_user["headers"]
        )
        assert resp.status_code == 400
        assert "already linked" in resp.json()["detail"].lower()

    async def test_get_accounts_empty(self, client, registered_user):
        resp = await client.get(
            "/api/upi/accounts", headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_get_accounts_returns_added_accounts(self, client, registered_user):
        await client.post(
            "/api/upi/accounts", json=_bank_payload(), headers=registered_user["headers"]
        )
        resp = await client.get(
            "/api/upi/accounts", headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    async def test_add_account_unauthenticated_returns_401(self, client):
        resp = await client.post("/api/upi/accounts", json=_bank_payload())
        assert resp.status_code == 401


class TestSendMoney:
    async def _setup_two_users_with_accounts(self, client, registered_user, second_user):
        """Give both users a bank account and return their UPI IDs."""
        await client.post(
            "/api/upi/accounts",
            json=_bank_payload("alice@upi"),
            headers=registered_user["headers"],
        )
        await client.post(
            "/api/upi/accounts",
            json={
                "bank_name": "SBI",
                "account_number": "0987654321",
                "ifsc_code": "SBI0001234",
                "account_holder": "Bob",
                "upi_id": "bob@upi",
            },
            headers=second_user["headers"],
        )

    async def test_send_money_success(self, client, registered_user, second_user):
        await self._setup_two_users_with_accounts(client, registered_user, second_user)

        resp = await client.post(
            "/api/upi/send-money",
            json={"to_upi_id": "bob@upi", "amount": 500.0, "note": "dinner share"},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["amount"] == 500.0
        assert data["from_upi_id"] == "alice@upi"
        assert data["to_upi_id"] == "bob@upi"
        assert "reference_id" in data

    async def test_send_money_insufficient_balance_returns_400(
        self, client, registered_user, second_user
    ):
        await self._setup_two_users_with_accounts(client, registered_user, second_user)

        resp = await client.post(
            "/api/upi/send-money",
            json={"to_upi_id": "bob@upi", "amount": 99999.0},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 400
        assert "insufficient" in resp.json()["detail"].lower()

    async def test_send_money_no_account_returns_400(self, client, registered_user):
        resp = await client.post(
            "/api/upi/send-money",
            json={"to_upi_id": "anyone@upi", "amount": 100.0},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 400
        assert "no bank account" in resp.json()["detail"].lower()

    async def test_send_money_updates_balances(self, client, registered_user, second_user):
        await self._setup_two_users_with_accounts(client, registered_user, second_user)

        await client.post(
            "/api/upi/send-money",
            json={"to_upi_id": "bob@upi", "amount": 1000.0},
            headers=registered_user["headers"],
        )

        alice_accounts = await client.get(
            "/api/upi/accounts", headers=registered_user["headers"]
        )
        alice_balance = alice_accounts.json()[0]["balance"]
        assert alice_balance == 9000.0

    async def test_send_money_unauthenticated_returns_401(self, client):
        resp = await client.post(
            "/api/upi/send-money",
            json={"to_upi_id": "bob@upi", "amount": 100.0},
        )
        assert resp.status_code == 401


class TestRequestMoney:
    async def _setup(self, client, registered_user, second_user):
        await client.post(
            "/api/upi/accounts",
            json=_bank_payload("alice@upi"),
            headers=registered_user["headers"],
        )
        await client.post(
            "/api/upi/accounts",
            json={
                "bank_name": "SBI",
                "account_number": "0987654321",
                "ifsc_code": "SBI0001234",
                "account_holder": "Bob",
                "upi_id": "bob@upi",
            },
            headers=second_user["headers"],
        )

    async def test_request_money_success(self, client, registered_user, second_user):
        await self._setup(client, registered_user, second_user)

        resp = await client.post(
            "/api/upi/request-money",
            json={"to_upi_id": "bob@upi", "amount": 200.0, "note": "for food"},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending"
        assert data["amount"] == 200.0
        assert data["from_upi_id"] == "alice@upi"
        assert data["to_upi_id"] == "bob@upi"

    async def test_request_money_unknown_upi_returns_404(
        self, client, registered_user
    ):
        await client.post(
            "/api/upi/accounts",
            json=_bank_payload("alice@upi"),
            headers=registered_user["headers"],
        )
        resp = await client.post(
            "/api/upi/request-money",
            json={"to_upi_id": "ghost@upi", "amount": 100.0},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 404

    async def test_get_money_requests_empty_without_account(
        self, client, registered_user
    ):
        resp = await client.get(
            "/api/upi/requests", headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_accept_money_request_success(
        self, client, registered_user, second_user
    ):
        await self._setup(client, registered_user, second_user)

        # Alice requests $100 from Bob
        req_resp = await client.post(
            "/api/upi/request-money",
            json={"to_upi_id": "bob@upi", "amount": 100.0},
            headers=registered_user["headers"],
        )
        request_id = req_resp.json()["id"]

        # Bob accepts
        accept_resp = await client.post(
            f"/api/upi/requests/{request_id}/accept",
            headers=second_user["headers"],
        )
        assert accept_resp.status_code == 200
        assert accept_resp.json()["status"] == "success"


class TestTransactions:
    async def test_get_transactions_empty_without_account(
        self, client, registered_user
    ):
        resp = await client.get(
            "/api/upi/transactions", headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_transactions_recorded_after_send(
        self, client, registered_user, second_user
    ):
        await client.post(
            "/api/upi/accounts",
            json=_bank_payload("alice@upi"),
            headers=registered_user["headers"],
        )
        await client.post(
            "/api/upi/accounts",
            json={
                "bank_name": "SBI",
                "account_number": "9876",
                "ifsc_code": "SBI0001",
                "account_holder": "Bob",
                "upi_id": "bob@upi",
            },
            headers=second_user["headers"],
        )
        await client.post(
            "/api/upi/send-money",
            json={"to_upi_id": "bob@upi", "amount": 50.0},
            headers=registered_user["headers"],
        )

        resp = await client.get(
            "/api/upi/transactions", headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        txns = resp.json()
        assert len(txns) == 1
        assert txns[0]["amount"] == 50.0


class TestBillPayment:
    async def test_bill_payment_success(self, client, registered_user):
        await client.post(
            "/api/upi/accounts",
            json=_bank_payload("alice@upi"),
            headers=registered_user["headers"],
        )
        resp = await client.post(
            "/api/upi/bill-payment",
            json={
                "biller_name": "Electricity Board",
                "bill_number": "EB123456",
                "amount": 1000.0,
                "category": "Utilities",
            },
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"
        assert "reference_id" in resp.json()

    async def test_bill_payment_insufficient_balance_returns_400(
        self, client, registered_user
    ):
        await client.post(
            "/api/upi/accounts",
            json=_bank_payload("alice@upi"),
            headers=registered_user["headers"],
        )
        resp = await client.post(
            "/api/upi/bill-payment",
            json={
                "biller_name": "EB",
                "bill_number": "EB1",
                "amount": 99999.0,
                "category": "Utilities",
            },
            headers=registered_user["headers"],
        )
        assert resp.status_code == 400


class TestRecharge:
    async def test_recharge_success(self, client, registered_user):
        await client.post(
            "/api/upi/accounts",
            json=_bank_payload("alice@upi"),
            headers=registered_user["headers"],
        )
        resp = await client.post(
            "/api/upi/recharge",
            json={
                "mobile_number": "9876543210",
                "operator": "Airtel",
                "amount": 299.0,
                "recharge_type": "prepaid",
            },
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"


class TestInitiatePayment:
    async def test_initiate_payment_creates_upi_url(self, client, registered_user):
        resp = await client.post(
            "/api/upi/initiate-payment",
            json={
                "upi_id": "bob@upi",
                "amount": 250.0,
                "settlement_id": "settle-123",
                "note": "Settlement payment",
            },
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "initiated"
        assert "payment_id" in data
        assert "upi://pay" in data["upi_url"]
        assert "bob@upi" in data["upi_url"]

    async def test_initiate_payment_unauthenticated_returns_401(self, client):
        resp = await client.post(
            "/api/upi/initiate-payment",
            json={"upi_id": "x@upi", "amount": 100.0, "settlement_id": "s1"},
        )
        assert resp.status_code == 401
