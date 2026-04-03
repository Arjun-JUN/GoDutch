"""
Integration tests for the /auth endpoints.
"""
import pytest


class TestAuthRegister:
    async def test_register_success(self, client):
        resp = await client.post(
            "/api/auth/register",
            json={"email": "newuser@test.com", "password": "Passw0rd!", "name": "New User"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["user"]["email"] == "newuser@test.com"
        assert data["user"]["name"] == "New User"

    async def test_register_duplicate_email_fails(self, client, registered_user):
        resp = await client.post(
            "/api/auth/register",
            json={"email": "alice@example.com", "password": "Passw0rd!", "name": "Alice2"},
        )
        assert resp.status_code == 400

    async def test_register_invalid_email_fails(self, client):
        resp = await client.post(
            "/api/auth/register",
            json={"email": "not-an-email", "password": "Passw0rd!", "name": "Bad"},
        )
        assert resp.status_code == 422

    async def test_register_short_password_fails(self, client):
        resp = await client.post(
            "/api/auth/register",
            json={"email": "x@test.com", "password": "12", "name": "Short Pass"},
        )
        assert resp.status_code == 422


class TestAuthLogin:
    async def test_login_success(self, client, registered_user):
        resp = await client.post(
            "/api/auth/login",
            json={"email": "alice@example.com", "password": "TestPass123!"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data

    async def test_login_wrong_password(self, client, registered_user):
        resp = await client.post(
            "/api/auth/login",
            json={"email": "alice@example.com", "password": "wrongpassword"},
        )
        assert resp.status_code == 401

    async def test_login_nonexistent_user(self, client):
        resp = await client.post(
            "/api/auth/login",
            json={"email": "ghost@test.com", "password": "anypassword"},
        )
        assert resp.status_code == 401
