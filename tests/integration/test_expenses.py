"""
Integration tests for expense and settlement endpoints.

POST /api/expenses
GET  /api/groups/{group_id}/expenses
GET  /api/groups/{group_id}/settlements
GET  /api/expenses/categories
GET  /api/groups/{group_id}/reports
"""
import pytest


def _expense_payload(group_id: str, payer_id: str, payer_name: str, other_id: str, other_name: str):
    """Build a $60 equal-split expense payload."""
    return {
        "group_id": group_id,
        "merchant": "Test Restaurant",
        "date": "2024-06-01",
        "total_amount": 60.0,
        "items": [{"name": "Dinner", "price": 60.0}],
        "split_type": "equal",
        "split_details": [
            {"user_id": payer_id, "user_name": payer_name, "amount": 30.0},
            {"user_id": other_id, "user_name": other_name, "amount": 30.0},
        ],
        "category": "Food & Dining",
    }


class TestCreateExpense:
    async def test_create_expense_success(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["merchant"] == "Test Restaurant"
        assert data["total_amount"] == 60.0
        assert data["group_id"] == test_group["id"]
        assert "id" in data
        assert "created_at" in data

    async def test_create_expense_stores_category(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        payload["category"] = "Transportation"
        resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        assert resp.json()["category"] == "Transportation"

    async def test_create_expense_unauthenticated_returns_401(
        self, client, test_group, registered_user, second_user
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        resp = await client.post("/api/expenses", json=payload)
        assert resp.status_code == 401

    async def test_create_expense_missing_merchant_returns_422(
        self, client, registered_user, test_group, second_user
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        del payload["merchant"]
        resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        assert resp.status_code == 422


class TestGetGroupExpenses:
    async def test_get_expenses_empty(self, client, registered_user, test_group):
        resp = await client.get(
            f"/api/groups/{test_group['id']}/expenses",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_get_expenses_after_creation(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        resp = await client.get(
            f"/api/groups/{test_group['id']}/expenses",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    async def test_get_expenses_wrong_group_returns_404(
        self, client, registered_user
    ):
        resp = await client.get(
            "/api/groups/nonexistent-group-id/expenses",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 404

    async def test_get_expenses_unauthenticated_returns_401(
        self, client, test_group
    ):
        resp = await client.get(f"/api/groups/{test_group['id']}/expenses")
        assert resp.status_code == 401


class TestGetSettlements:
    async def test_settlements_empty_when_no_expenses(
        self, client, registered_user, test_group
    ):
        resp = await client.get(
            f"/api/groups/{test_group['id']}/settlements",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_settlements_one_expense_bob_owes_alice(
        self, client, registered_user, second_user, test_group
    ):
        """Alice pays $60, split equally → Bob owes Alice $30."""
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        resp = await client.get(
            f"/api/groups/{test_group['id']}/settlements",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        settlements = resp.json()
        assert len(settlements) == 1
        s = settlements[0]
        assert s["from_user_id"] == bob["id"]
        assert s["to_user_id"] == alice["id"]
        assert s["amount"] == 30.0

    async def test_settlements_mutual_expenses_net_correctly(
        self, client, registered_user, second_user, test_group
    ):
        """
        Alice pays $60 (Bob owes $30).
        Bob pays $20 (Alice owes $20).
        Net: Bob owes Alice $10.
        """
        alice = registered_user["user"]
        bob = second_user["user"]

        # Expense 1: Alice pays $60
        exp1 = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        await client.post("/api/expenses", json=exp1, headers=registered_user["headers"])

        # Expense 2: Bob pays $20 (split: Bob $10, Alice $10)
        exp2 = {
            "group_id": test_group["id"],
            "merchant": "Coffee Shop",
            "date": "2024-06-02",
            "total_amount": 20.0,
            "items": [{"name": "Coffee", "price": 20.0}],
            "split_type": "equal",
            "split_details": [
                {"user_id": bob["id"], "user_name": bob["name"], "amount": 10.0},
                {"user_id": alice["id"], "user_name": alice["name"], "amount": 10.0},
            ],
        }
        await client.post("/api/expenses", json=exp2, headers=second_user["headers"])

        resp = await client.get(
            f"/api/groups/{test_group['id']}/settlements",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        settlements = resp.json()
        assert len(settlements) == 1
        assert settlements[0]["from_user_id"] == bob["id"]
        assert settlements[0]["amount"] == 10.0

    async def test_settlements_wrong_group_returns_404(
        self, client, registered_user
    ):
        resp = await client.get(
            "/api/groups/fake-group-id/settlements",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 404


class TestGetExpense:
    async def test_get_expense_success(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        create_resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        expense_id = create_resp.json()["id"]

        resp = await client.get(
            f"/api/expenses/{expense_id}", headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == expense_id
        assert data["merchant"] == "Test Restaurant"

    async def test_get_expense_not_found_returns_404(self, client, registered_user):
        resp = await client.get(
            "/api/expenses/nonexistent-id", headers=registered_user["headers"]
        )
        assert resp.status_code == 404

    async def test_get_expense_non_member_returns_403(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        create_resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        expense_id = create_resp.json()["id"]

        # third user not in the group
        third = await client.post(
            "/api/auth/register",
            json={"email": "third@test.com", "password": "pass123", "name": "Third"},
        )
        third_headers = {"Authorization": f"Bearer {third.json()['token']}"}
        resp = await client.get(
            f"/api/expenses/{expense_id}", headers=third_headers
        )
        assert resp.status_code == 403

    async def test_get_expense_unauthenticated_returns_401(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        create_resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        expense_id = create_resp.json()["id"]
        resp = await client.get(f"/api/expenses/{expense_id}")
        assert resp.status_code == 401


class TestUpdateExpense:
    async def test_update_expense_success(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        create_resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        expense_id = create_resp.json()["id"]

        resp = await client.put(
            f"/api/expenses/{expense_id}",
            json={"merchant": "Updated Cafe", "category": "Entertainment"},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["merchant"] == "Updated Cafe"
        assert data["category"] == "Entertainment"
        assert data["total_amount"] == 60.0  # unchanged

    async def test_update_expense_non_creator_returns_403(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        create_resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        expense_id = create_resp.json()["id"]

        resp = await client.put(
            f"/api/expenses/{expense_id}",
            json={"merchant": "Hack"},
            headers=second_user["headers"],
        )
        assert resp.status_code == 403

    async def test_update_expense_not_found_returns_404(
        self, client, registered_user
    ):
        resp = await client.put(
            "/api/expenses/nonexistent-id",
            json={"merchant": "Ghost"},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 404

    async def test_update_expense_notes(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        create_resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        expense_id = create_resp.json()["id"]

        resp = await client.put(
            f"/api/expenses/{expense_id}",
            json={"notes": "Split was agreed verbally"},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["notes"] == "Split was agreed verbally"

    async def test_update_expense_unauthenticated_returns_401(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        create_resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        expense_id = create_resp.json()["id"]
        resp = await client.put(
            f"/api/expenses/{expense_id}", json={"merchant": "X"}
        )
        assert resp.status_code == 401


class TestExpenseCategories:
    async def test_returns_known_categories(self, client, registered_user):
        resp = await client.get(
            "/api/expenses/categories", headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        cats = resp.json()["categories"]
        assert "Food & Dining" in cats
        assert "Transportation" in cats
        assert "Other" in cats

    async def test_unauthenticated_returns_401(self, client):
        resp = await client.get("/api/expenses/categories")
        assert resp.status_code == 401


class TestExpenseReports:
    async def test_reports_no_expenses(
        self, client, registered_user, test_group
    ):
        resp = await client.get(
            f"/api/groups/{test_group['id']}/reports",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_expenses"] == 0
        assert data["total_amount"] == 0
        assert data["average_expense"] == 0

    async def test_reports_with_expenses(
        self, client, registered_user, second_user, test_group
    ):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        resp = await client.get(
            f"/api/groups/{test_group['id']}/reports",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_expenses"] == 1
        assert data["total_amount"] == 60.0
        assert data["average_expense"] == 60.0
        assert "category_breakdown" in data
        assert "monthly_trend" in data

    async def test_reports_wrong_group_returns_404(
        self, client, registered_user
    ):
        resp = await client.get(
            "/api/groups/no-such-group/reports",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 404


class TestDeleteExpense:
    async def _create_expense(self, client, registered_user, second_user, test_group):
        alice = registered_user["user"]
        bob = second_user["user"]
        payload = _expense_payload(
            test_group["id"], alice["id"], alice["name"], bob["id"], bob["name"]
        )
        resp = await client.post(
            "/api/expenses", json=payload, headers=registered_user["headers"]
        )
        assert resp.status_code == 200
        return resp.json()

    async def test_creator_can_delete_expense(
        self, client, registered_user, second_user, test_group
    ):
        expense = await self._create_expense(client, registered_user, second_user, test_group)
        resp = await client.delete(
            f"/api/expenses/{expense['id']}", headers=registered_user["headers"]
        )
        assert resp.status_code == 204

        # Verify it's gone
        get_resp = await client.get(
            f"/api/expenses/{expense['id']}", headers=registered_user["headers"]
        )
        assert get_resp.status_code == 404

    async def test_non_creator_cannot_delete_expense(
        self, client, registered_user, second_user, test_group
    ):
        expense = await self._create_expense(client, registered_user, second_user, test_group)
        resp = await client.delete(
            f"/api/expenses/{expense['id']}", headers=second_user["headers"]
        )
        assert resp.status_code == 403

    async def test_delete_nonexistent_expense_returns_404(
        self, client, registered_user
    ):
        resp = await client.delete(
            "/api/expenses/no-such-id", headers=registered_user["headers"]
        )
        assert resp.status_code == 404

    async def test_delete_unauthenticated_returns_401(
        self, client, registered_user, second_user, test_group
    ):
        expense = await self._create_expense(client, registered_user, second_user, test_group)
        resp = await client.delete(f"/api/expenses/{expense['id']}")
        assert resp.status_code == 401
