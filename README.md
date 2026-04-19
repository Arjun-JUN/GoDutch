# GoDutch

GoDutch is a React Native-first split-expense app focused on polished mobile UX, shared ledgers, and fast group settlements.

- **Backend**: `FastAPI` in `backend/`
- **Mobile**: `Expo` + React Native in `mobile/`
- **Database**: `MongoDB`

## Repo Layout

- `backend/` contains the API, auth, AI helpers, and seed script.
- `mobile/` contains the Expo app, Slate UI components, stores, and mobile tests.
- `tests/` contains the backend unit and integration suite.
- `DESIGN_RULES/` contains the canonical product design guidance.

## Quick Start

```bash
pnpm install
cd mobile && pnpm install
cd ..
pnpm dev
```

`pnpm dev` starts FastAPI on port `8000` and the Expo dev server for the mobile app.

## Environment

Backend expects `backend/.env` with values like:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=godutch
JWT_SECRET=your-secure-secret
CORS_ORIGINS=http://localhost:8081
GEMINI_API_KEY=your_key_here
```

Mobile expects:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## Tests

```bash
pytest
pytest --cov=backend/app
cd mobile && pnpm test
cd mobile && pnpm test --coverage
```

## Notes

- The mobile app is the only delivery platform in this repo.
- Generated artifacts, scratch files, coverage output, and workspace-specific metadata are intentionally kept out of version control.
