# GoDutch — Project Guidelines

## Architecture

- **Backend**: FastAPI structured package. Entry point: `backend/app/main.py`.
- **Frontend**: React 18+ + Vite + Slate Design System + framer-motion.
- **Auth**: JWT (30-day expiry). `verify_token` dependency on every protected route.
- **AI**: Gemini API for receipt OCR (`/api/ocr/scan`) and smart split (`/api/ai/smart-split`).
- **DB Seeding**: `backend/seed.py` populates dev data. Run separately if needed.

## Running locally

To start both Backend and Frontend integrated:

```bash
pnpm dev
```

Note: This uses `concurrently` from the root to start the FastAPI server (port 8000) and the Vite frontend (port 3000).

## Tests

Every code change must include tests. Never mark done without running them.

```bash
# Backend — from project root
pytest                       # all tests
pytest tests/unit/ -x        # unit only, stop on first fail

# Frontend
cd frontend && pnpm test
```

- Backend tests use `mongomock-motor` (no real DB needed).
- Frontend tests use Vitest and mock framer-motion for jsdom compatibility.

## Design

Follow [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) strictly: tonal topography, no-line rule, 4-point grid, ambient luminosity, generous breath.

## Status

**Phase: Tech Debt Remediation & UI Polish.**
The project has been migrated to `pnpm` and the backend has been modularized.
All UI components use the **Slate** library in `src/slate`.

Open bugs — see [`PQ_BUGS_LOG.md`](./PQ_BUGS_LOG.md):
- **B003**: Any user can settle for anyone (auth gap).
- **B005**: Enhance Add Expense UX (line-item visibility, quantities, card aesthetic).
