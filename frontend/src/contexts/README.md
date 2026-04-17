# frontend/src/contexts

> React context providers: global application state accessible from any component.

## Overview

Currently one context: `AuthContext`. It holds the JWT token, the decoded current-user object, and the login/logout functions. Because auth state is needed everywhere (API headers, route guards, user display), it lives at the context level rather than in a page or hook.

## How it works

1. `<AuthProvider>` wraps the entire app in `App.js`.
2. On mount, it reads the JWT from localStorage. If present and valid, it sets the user state.
3. `login(token, user)` saves the token to localStorage and updates state; `logout()` clears both.
4. Any component calls `useContext(AuthContext)` (or `useAuth()`) to read `{ user, token, login, logout }`.
5. `MainRoutes.js` checks `!!token` to decide whether to render protected routes.

## Key files

| File | What it does |
|------|-------------|
| `AuthContext.js` | Context definition, `AuthProvider` component, `useAuth` convenience hook |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `App.js` | Wraps app with `<AuthProvider>` |
| Downstream | `lib/api.js` | Reads `token` to set `Authorization` header |
| Downstream | `pages/` | Reads `user` for display; calls `logout` |
| Downstream | `MainRoutes.js` | Guards protected routes |

## Gotchas

- Token is stored in localStorage, which is accessible to JavaScript on the same origin. This is acceptable for a dev-stage app but should be hardened (httpOnly cookie) before a public launch.
- The context does not validate the JWT signature client-side — it trusts the token until the server rejects it with 401, at which point `logout()` should be called.

## Further reading

- [lib/](../lib/README.md)
- [pages/AuthPageRedesign.js](../pages/README.md)
