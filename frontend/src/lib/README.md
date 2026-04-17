# frontend/src/lib

> Shared libraries: the API client, application constants, and general-purpose utility functions.

## Overview

This directory is the adapter layer between the React app and the outside world. `api.js` is the single place where HTTP requests are constructed and sent — no page should use `fetch` or `axios` directly. `constants.js` centralizes magic numbers and strings. `utils.js` holds formatting and calculation helpers that don't belong to a specific domain.

## How it works

`api.js` exports a client object with `get`, `post`, `put`, `delete` methods. Each method reads the JWT from `AuthContext` (or localStorage) and attaches it as `Authorization: Bearer <token>`. Responses are parsed as JSON; non-2xx responses throw an error with the server's `detail` message.

## Key files

| File | What it does |
|------|-------------|
| `api.js` | HTTP client — all REST calls to the backend |
| `constants.js` | App-wide constants — category list, split types, limits |
| `utils.js` | Formatting helpers — currency, dates, names |

## Inputs & Outputs

**Takes in:** Method + path + optional body from callers (pages, contexts).
**Emits:** Parsed JSON response objects; throws `Error` on non-2xx.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `pages/` | All data fetching and mutations |
| Upstream | `contexts/AuthContext.js` | Login/logout calls |
| Downstream | `backend/` | HTTP REST on `VITE_API_URL` |

## Gotchas

- If `VITE_API_URL` is not set, the API client falls back to `http://localhost:8000`. Always set it in `.env.local` for production.
- Error messages come from the backend's `detail` field. If the backend changes its error format, `api.js` must be updated to match.

## Further reading

- [pages/](../pages/README.md)
- [backend/app/routes/](../../../backend/app/routes/README.md)
