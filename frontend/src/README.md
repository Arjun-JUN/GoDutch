# frontend/src

> Application source: routing, pages, design system, API client, and global state.

## Overview

This is where all React code lives. The structure mirrors the separation of concerns: `pages/` owns full-screen views, `slate/` owns the design system, `lib/` owns the API client and shared utilities, `contexts/` owns global state, and `utils/` owns calculation logic.

The application has no Redux or Zustand — state is managed with React's built-in `useState`/`useEffect` per page, plus the `AuthContext` for cross-cutting user identity.

## How it works

1. `index.js` mounts `<App />`.
2. `App.js` wraps with `<BrowserRouter>` and `<AuthProvider>`.
3. `MainRoutes.js` declares routes. Protected routes render only when `AuthContext` has a valid token; otherwise they redirect to `/auth`.
4. Each page component fetches its own data on mount via `lib/api.js`.

## Key files

| File | What it does |
|------|-------------|
| `index.js` | React DOM root mount |
| `App.js` | BrowserRouter + AuthProvider wrapper |
| `MainRoutes.js` | `<Routes>` definition; auth guard logic |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `../index.html` + Vite | bundle entry |
| Downstream | `pages/` | route targets |
| Downstream | `slate/` | UI components |
| Downstream | `lib/api.js` | all HTTP calls |
| Downstream | `contexts/AuthContext.js` | user identity |

## Further reading

- [pages/](pages/README.md)
- [slate/](slate/README.md)
- [lib/](lib/README.md)
- [contexts/](contexts/README.md)
- [utils/](utils/README.md)
