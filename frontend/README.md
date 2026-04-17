# frontend

> React 18 + Vite web application: the browser client for GoDutch.

## Overview

This directory is the complete web frontend. It is a single-page application (SPA) built with React 18, bundled by Vite, and styled with Tailwind CSS plus the GoDutch Slate design system. The app communicates exclusively with the backend at `http://localhost:8000` via the API client in `src/lib/api.js`.

Authentication is JWT-based: the token is stored in localStorage and attached to every request by the API client. All protected routes redirect to `/auth` if the token is absent or expired.

## How it works

1. `index.html` loads the Vite bundle; React mounts at `#root`.
2. `src/index.js` renders `<App />` wrapped in `<AuthProvider>`.
3. `src/App.js` wraps the router. `src/MainRoutes.js` defines all routes, wrapping protected routes in an auth guard.
4. On each navigation, the matching page component renders and calls the API client to fetch data.
5. Mutations (create expense, settle, etc.) call the API client, then update local state or re-fetch.

## Key files

| File | What it does |
|------|-------------|
| `index.html` | HTML shell; Vite entry point |
| `vite.config.js` | Dev server on port 3000, API proxy to 8000 |
| `tailwind.config.js` | Tailwind config — GoDutch design tokens |
| `src/index.js` | React root mount |
| `src/App.js` | Router wrapper |
| `src/MainRoutes.js` | Route definitions and auth guard |
| `src/.env.local` | `VITE_API_URL` for the backend base URL |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | Browser | HTTP requests to port 3000 (dev) |
| Downstream | `backend/` | HTTP REST via `src/lib/api.js` |
| Downstream | Tailwind / Slate | CSS class-based styling |

## Gotchas

- The Vite dev server proxies `/api/*` to `localhost:8000`. In production, CORS must be configured explicitly.
- `craco.config.js` is a leftover from a Create React App migration — it is not used by Vite and can be safely ignored.

## Further reading

- [src/](src/README.md) — application source
- [../backend/](../backend/README.md) — API server
