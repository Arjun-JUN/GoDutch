# GoDutch — Project Guidelines

## Architecture

- **Backend**: FastAPI + MongoDB (Motor async). `backend/server.py` is the single-file API.
- **Frontend**: React 19 + Vite + Tailwind + Radix UI + framer-motion.
- **Auth**: JWT (30-day expiry). `verify_token` dependency on every protected route.
- **AI**: Gemini API for receipt OCR (`/api/ocr/scan`) and smart split (`/api/ai/smart-split`).
- **DB Seeding**: `backend/seed.py` populates dev data on startup.

## Running locally

To start both Backend and Frontend + automatically open the browser:

```bash
npm run dev
```

Note: Frontend is configured to auto-open `http://localhost:3000` via `vite --open`.


## Tests

Every code change must include tests. Never mark done without running them.

```bash
# Backend — from project root
pytest                       # all tests
pytest tests/unit/ -x        # unit only, stop on first fail

# Frontend
cd frontend && npx vitest run
```

- Backend tests use `mongomock-motor` (no real DB needed).
- Frontend mocks framer-motion for jsdom compatibility.

## Design

Follow [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) strictly: tonal topography, no-line rule, 4-point grid, ambient luminosity, generous breath.

## Status

**Phase: PQ Fixes (Milestone 3).** MVP and hosting are done.

Open bugs — see [`PQ_BUGS_LOG.md`](./PQ_BUGS_LOG.md):
- **B003**: Any user can settle for anyone (auth gap).
- **B005**: Enhance Add Expense UX (line-item visibility, quantities, card aesthetic).
