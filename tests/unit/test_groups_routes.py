"""
Integration tests for the /groups endpoints.
"""
import pytest


class TestGroupsCRUD:
    async def test_create_group(self, client, registered_user, second_user):
        resp = await client.post(
            "/api/groups",
            json={
                "name": "Weekend Trip",
                "member_emails": ["alice@example.com", "bob@example.com"],
                "currency": "INR",
            },
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Weekend Trip"
        assert len(data["members"]) == 2
        assert "id" in data

    async def test_get_groups(self, client, registered_user, test_group):
        resp = await client.get("/api/groups", headers=registered_user["headers"])
        assert resp.status_code == 200
        groups = resp.json()
        assert any(g["id"] == test_group["id"] for g in groups)

    async def test_get_groups_unauthenticated(self, client):
        resp = await client.get("/api/groups")
        assert resp.status_code == 401

    async def test_create_group_with_invalid_email(self, client, registered_user):
        resp = await client.post(
            "/api/groups",
            json={"name": "Bad Group", "member_emails": ["not-an-email"]},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 422

    async def test_create_group_short_name(self, client, registered_user, second_user):
        resp = await client.post(
            "/api/groups",
            json={"name": "X", "member_emails": ["alice@example.com", "bob@example.com"]},
            headers=registered_user["headers"],
        )
        assert resp.status_code == 422

    async def test_group_settlements_empty_with_no_expenses(self, client, registered_user, test_group):
        group_id = test_group["id"]
        resp = await client.get(
            f"/api/groups/{group_id}/settlements",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_group_settlements_with_expenses(self, client, registered_user, second_user, test_group):
        group_id = test_group["id"]
        alice_id = registered_user["user"]["id"]
        bob_id = second_user["user"]["id"]

        # Alice creates an expense, Bob owes her 100
        await client.post(
            "/api/expenses",
            json={
                "group_id": group_id,
                "merchant": "Dinner",
                "date": "2024-06-01",
                "total_amount": 200.0,
                "items": [{"name": "Dinner", "price": 200.0, "quantity": 1}],
                "split_type": "equal",
                "split_details": [
                    {"user_id": alice_id, "user_name": "Alice", "amount": 100.0},
                    {"user_id": bob_id, "user_name": "Bob", "amount": 100.0},
                ],
            },
            headers=registered_user["headers"],
        )

        resp = await client.get(
            f"/api/groups/{group_id}/settlements",
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        settlements = resp.json()
        assert len(settlements) == 1
        assert settlements[0]["from_user_id"] == bob_id
        assert settlements[0]["to_user_id"] == alice_id
        assert settlements[0]["amount"] == 100.0
