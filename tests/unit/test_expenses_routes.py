"""
Integration tests for the /expenses and /groups endpoints.

Uses the conftest-provided `client` and `test_group` fixtures which
rely on mongomock-motor for an in-memory database.
"""
import pytest


class TestExpensesCRUD:
    """Full CRUD cycle for expenses through the HTTP API."""

    @pytest.fixture
    async def expense_payload(self, test_group, registered_user, second_user):
        """Return a valid expense creation payload."""
        group_id = test_group["id"]
        alice_id = registered_user["user"]["id"]
        bob_id = second_user["user"]["id"]
        return {
            "group_id": group_id,
            "merchant": "Starbucks",
            "date": "2024-06-01",
            "total_amount": 500.0,
            "items": [
                {"name": "Latte", "price": 250.0, "quantity": 1},
                {"name": "Muffin", "price": 250.0, "quantity": 1},
            ],
            "split_type": "equal",
            "split_details": [
                {"user_id": alice_id, "user_name": "Alice", "amount": 250.0},
                {"user_id": bob_id, "user_name": "Bob", "amount": 250.0},
            ],
            "category": "Food & Dining",
        }

    async def test_create_expense(self, client, registered_user, expense_payload):
        resp = await client.post(
            "/api/expenses",
            json=expense_payload,
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["merchant"] == "Starbucks"
        assert data["total_amount"] == 500.0
        assert "id" in data

    async def test_get_expense_by_id(self, client, registered_user, expense_payload):
        # Create first
        create_resp = await client.post(
            "/api/expenses",
            json=expense_payload,
            headers=registered_user["headers"],
        )
        expense_id = create_resp.json()["id"]

        # Fetch it
        resp = await client.get(
            f"/api/expenses/{expense_id}",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert resp.json()["id"] == expense_id

    async def test_get_expense_not_found(self, client, registered_user):
        resp = await client.get(
            "/api/expenses/nonexistent-id",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 404

    async def test_update_expense(self, client, registered_user, expense_payload):
        create_resp = await client.post(
            "/api/expenses",
            json=expense_payload,
            headers=registered_user["headers"],
        )
        expense_id = create_resp.json()["id"]

        update_resp = await client.put(
            f"/api/expenses/{expense_id}",
            json={"merchant": "Updated Cafe", "notes": "Changed name"},
            headers=registered_user["headers"],
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["merchant"] == "Updated Cafe"
        assert update_resp.json()["notes"] == "Changed name"

    async def test_delete_expense(self, client, registered_user, expense_payload):
        create_resp = await client.post(
            "/api/expenses",
            json=expense_payload,
            headers=registered_user["headers"],
        )
        expense_id = create_resp.json()["id"]

        delete_resp = await client.delete(
            f"/api/expenses/{expense_id}",
            headers=registered_user["headers"],
        )
        assert delete_resp.status_code == 204

        # Verify it's gone
        get_resp = await client.get(
            f"/api/expenses/{expense_id}",
            headers=registered_user["headers"],
        )
        assert get_resp.status_code == 404

    async def test_get_group_expenses(self, client, registered_user, expense_payload, test_group):
        # Create two expenses
        await client.post("/api/expenses", json=expense_payload, headers=registered_user["headers"])
        await client.post("/api/expenses", json=expense_payload, headers=registered_user["headers"])

        group_id = test_group["id"]
        resp = await client.get(f"/api/groups/{group_id}/expenses", headers=registered_user["headers"])
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    async def test_get_expense_categories(self, client, registered_user):
        resp = await client.get("/api/expenses/categories", headers=registered_user["headers"])
        assert resp.status_code == 200
        data = resp.json()
        assert "categories" in data
        assert "Food & Dining" in data["categories"]

    async def test_create_expense_requires_auth(self, client, expense_payload):
        resp = await client.post("/api/expenses", json=expense_payload)
        assert resp.status_code == 401
