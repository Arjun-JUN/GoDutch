"""
Integration tests for authentication endpoints.

POST /api/auth/register
POST /api/auth/login
"""
import pytest


class TestRegister:
    async def test_register_success_returns_token_and_user(self, client):
        resp = await client.post(
            "/api/auth/register",
            json={"email": "new@example.com", "password": "Pass123!", "name": "New User"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["user"]["email"] == "new@example.com"
        assert data["user"]["name"] == "New User"
        assert "id" in data["user"]
        assert "created_at" in data["user"]
        # Password must not leak into the response
        assert "password" not in data["user"]
        assert "password_hash" not in data["user"]

    async def test_register_duplicate_email_returns_400(self, client):
        payload = {"email": "dup@example.com", "password": "Pass123!", "name": "Dup"}
        await client.post("/api/auth/register", json=payload)
        resp = await client.post("/api/auth/register", json=payload)
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"].lower()

    async def test_register_invalid_email_returns_422(self, client):
        resp = await client.post(
            "/api/auth/register",
            json={"email": "not-valid", "password": "Pass123!", "name": "X"},
        )
        assert resp.status_code == 422

    async def test_register_missing_name_returns_422(self, client):
        resp = await client.post(
            "/api/auth/register",
            json={"email": "a@b.com", "password": "Pass123!"},
        )
        assert resp.status_code == 422

    async def test_register_missing_password_returns_422(self, client):
        resp = await client.post(
            "/api/auth/register",
            json={"email": "a@b.com", "name": "Alice"},
        )
        assert resp.status_code == 422


class TestLogin:
    async def test_login_success_returns_token(self, client):
        # First register
        await client.post(
            "/api/auth/register",
            json={"email": "login@example.com", "password": "Pass123!", "name": "Login User"},
        )
        # Then login
        resp = await client.post(
            "/api/auth/login",
            json={"email": "login@example.com", "password": "Pass123!"},
        )
        assert resp.status_code == 200
        assert "token" in resp.json()
        assert resp.json()["user"]["email"] == "login@example.com"

    async def test_login_wrong_password_returns_401(self, client):
        await client.post(
            "/api/auth/register",
            json={"email": "wp@example.com", "password": "Correct123!", "name": "WP"},
        )
        resp = await client.post(
            "/api/auth/login",
            json={"email": "wp@example.com", "password": "WrongPassword!"},
        )
        assert resp.status_code == 401

    async def test_login_nonexistent_user_returns_401(self, client):
        resp = await client.post(
            "/api/auth/login",
            json={"email": "ghost@example.com", "password": "Pass123!"},
        )
        assert resp.status_code == 401

    async def test_login_invalid_email_format_returns_422(self, client):
        resp = await client.post(
            "/api/auth/login",
            json={"email": "bad-email", "password": "Pass123!"},
        )
        assert resp.status_code == 422


class TestAuthProtection:
    async def test_protected_endpoint_no_token_returns_401(self, client):
        resp = await client.get("/api/groups")
        assert resp.status_code == 401

    async def test_protected_endpoint_invalid_token_returns_401(self, client):
        resp = await client.get(
            "/api/groups",
            headers={"Authorization": "Bearer totally.invalid.token"},
        )
        assert resp.status_code == 401

    async def test_protected_endpoint_malformed_header_returns_401(self, client):
        resp = await client.get(
            "/api/groups",
            headers={"Authorization": "NotBearer some-token"},
        )
        assert resp.status_code == 401

    async def test_valid_token_allows_access(self, client, registered_user):
        resp = await client.get("/api/groups", headers=registered_user["headers"])
        assert resp.status_code == 200
