# mobile/src/api

> HTTP client for the mobile app: all communication with the GoDutch backend goes through here.

## Overview

One file, one responsibility: wrap native `fetch` into a typed, auth-aware API client. Every route and store that needs backend data imports from here. No direct `fetch` calls anywhere else in the codebase.

The client was migrated from Axios to native `fetch` to reduce bundle size. The API is intentionally similar to Axios so migration was smooth, but edge cases (timeout, multipart) may behave differently.

## How it works

1. `client.ts` exports a `client` object with `get`, `post`, `put`, `delete` methods.
2. Each method reads the stored JWT (AsyncStorage), prepends the base URL, and attaches `Authorization: Bearer <token>`.
3. Non-2xx responses throw a typed `ApiError` with the backend's `detail` message.
4. Callers (stores, route files) catch `ApiError` and update error state accordingly.

## Key files

| File | What it does |
|------|-------------|
| `client.ts` | HTTP client — all backend calls |
| `__tests__/client.test.ts` | Unit tests for request building, auth header, error handling |

## Inputs & Outputs

**Takes in:** Method, path, optional body + auth token from AsyncStorage.
**Emits:** Parsed JSON response; throws `ApiError` on non-2xx.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `src/stores/` | Fetch data for store hydration |
| Upstream | `app/` route files | One-off calls not in stores |
| Downstream | `backend/` | HTTP REST on `API_BASE_URL` from `.env.local` |

## Gotchas

- `API_BASE_URL` must be set in `mobile/.env.local`. On a physical device, `localhost` will not work — use the machine's LAN IP.
- Timeout handling is not built into native `fetch`. Long-running requests (OCR scans) can hang indefinitely — add `AbortController` if this becomes an issue.

## Further reading

- [../stores/](../stores/README.md)
- [backend/app/routes/](../../../backend/app/routes/README.md)
