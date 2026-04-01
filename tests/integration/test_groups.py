"""
Integration tests for group endpoints.

POST /api/groups
GET  /api/groups
"""
import pytest


class TestCreateGroup:
    async def test_create_group_success(self, client, registered_user, second_user):
        resp = await client.post(
            "/api/groups",
            json={
                "name": "Goa Trip",
                "member_emails": ["alice@example.com", "bob@example.com"],
            },
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Goa Trip"
        assert "id" in data
        assert "created_at" in data
        member_emails = [m["email"] for m in data["members"]]
        assert "alice@example.com" in member_emails
        assert "bob@example.com" in member_emails

    async def test_create_group_creator_auto_added_when_not_in_list(
        self, client, registered_user, second_user
    ):
        """Creator is added to members even if their email is omitted."""
        resp = await client.post(
            "/api/groups",
            json={
                "name": "Auto-add group",
                "member_emails": ["bob@example.com"],
            },
            headers=registered_user["headers"],
        )
        assert resp.status_code == 200
        member_emails = [m["email"] for m in resp.json()["members"]]
        assert "alice@example.com" in member_emails

    async def test_create_group_nonexistent_member_returns_400(
        self, client, registered_user
    ):
        resp = await client.post(
            "/api/groups",
            json={
                "name": "Bad Group",
                "member_emails": ["ghost@example.com"],
            },
            headers=registered_user["headers"],
        )
        assert resp.status_code == 400

    async def test_create_group_unauthenticated_returns_401(self, client):
        resp = await client.post(
            "/api/groups",
            json={"name": "Unauthorized", "member_emails": []},
        )
        assert resp.status_code == 401


class TestGetGroups:
    async def test_get_groups_empty_when_no_groups(self, client, registered_user):
        resp = await client.get("/api/groups", headers=registered_user["headers"])
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_get_groups_returns_created_groups(
        self, client, registered_user, second_user
    ):
        await client.post(
            "/api/groups",
            json={"name": "Group A", "member_emails": ["alice@example.com", "bob@example.com"]},
            headers=registered_user["headers"],
        )
        resp = await client.get("/api/groups", headers=registered_user["headers"])
        assert resp.status_code == 200
        groups = resp.json()
        assert len(groups) == 1
        assert groups[0]["name"] == "Group A"

    async def test_get_groups_only_returns_user_memberships(
        self, client, registered_user, second_user
    ):
        """A group that doesn't include Alice should not appear in Alice's list."""
        # Bob creates a group with only himself
        resp = await client.post(
            "/api/auth/register",
            json={"email": "carol@example.com", "password": "Pass123!", "name": "Carol"},
        )
        carol_headers = {"Authorization": f"Bearer {resp.json()['token']}"}

        await client.post(
            "/api/groups",
            json={"name": "Bob+Carol Group", "member_emails": ["bob@example.com", "carol@example.com"]},
            headers=second_user["headers"],
        )

        alice_groups = await client.get("/api/groups", headers=registered_user["headers"])
        group_names = [g["name"] for g in alice_groups.json()]
        assert "Bob+Carol Group" not in group_names

    async def test_get_groups_unauthenticated_returns_401(self, client):
        resp = await client.get("/api/groups")
        assert resp.status_code == 401
