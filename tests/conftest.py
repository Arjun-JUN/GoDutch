"""
Shared pytest fixtures for all tests.

Environment variables must be set before importing the backend because
the app reads them at module-load time (JWT_SECRET, DB_NAME, etc.).
Motor's AsyncIOMotorClient is lazy, so no real MongoDB connection is made
until the first query — we swap in a mongomock-motor database before any
endpoint is called.
"""
import os
import sys

# ── env vars BEFORE any backend import ──────────────────────────────────────
os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "test_godutch")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-for-testing")
os.environ.setdefault("GEMINI_API_KEY", "")

# ── project root on sys.path so `import backend.app.main` works ─────────────
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, _PROJECT_ROOT)
# ── backend/ on sys.path so `from seed import seed_data` resolves correctly ─
sys.path.insert(0, os.path.join(_PROJECT_ROOT, 'backend'))

import pytest
import mongomock_motor
from httpx import AsyncClient, ASGITransport

import app.database as database
from app.main import app


# ── Database fixture ─────────────────────────────────────────────────────────

@pytest.fixture
async def mock_db(monkeypatch):
    """
    Replace app.database.db with a fresh in-memory MongoDB for every test.
    mongomock-motor is a drop-in async replacement for Motor, so all
    Motor-style awaits (find_one, insert_one, to_list, …) work unchanged.
    """
    mock_client = mongomock_motor.AsyncMongoMockClient()
    db = mock_client["test_godutch"]
    monkeypatch.setattr(database, "db", db)
    # Also patch all router modules that imported db directly at load time
    import app.routes.auth as auth_routes
    import app.routes.groups as groups_routes
    import app.routes.expenses as expenses_routes
    import app.routes.settlements as settlements_routes
    import app.routes.upi as upi_routes
    import app.routes.ai as ai_routes
    import app.routes.dev as dev_routes
    for module in (auth_routes, groups_routes, expenses_routes,
                   settlements_routes, upi_routes, ai_routes, dev_routes):
        monkeypatch.setattr(module, "db", db)
    yield db


# ── HTTP client fixture ───────────────────────────────────────────────────────

@pytest.fixture
async def client(mock_db):
    """Async HTTPX client wired directly to the FastAPI app (no network)."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


# ── User fixtures ─────────────────────────────────────────────────────────────

@pytest.fixture
async def registered_user(client):
    """Register Alice and return token + user metadata."""
    resp = await client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "password": "TestPass123!", "name": "Alice"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    return {
        "token": data["token"],
        "user": data["user"],
        "email": "alice@example.com",
        "password": "TestPass123!",
        "headers": {"Authorization": f"Bearer {data['token']}"},
    }


@pytest.fixture
async def second_user(client):
    """Register Bob and return token + user metadata."""
    resp = await client.post(
        "/api/auth/register",
        json={"email": "bob@example.com", "password": "TestPass123!", "name": "Bob"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    return {
        "token": data["token"],
        "user": data["user"],
        "email": "bob@example.com",
        "password": "TestPass123!",
        "headers": {"Authorization": f"Bearer {data['token']}"},
    }


# ── Group fixture ─────────────────────────────────────────────────────────────

@pytest.fixture
async def test_group(client, registered_user, second_user):
    """Create a group owned by Alice containing Alice and Bob."""
    resp = await client.post(
        "/api/groups",
        json={
            "name": "Test Group",
            "member_emails": ["alice@example.com", "bob@example.com"],
        },
        headers=registered_user["headers"],
    )
    assert resp.status_code == 200, resp.text
    return resp.json()
