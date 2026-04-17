# mobile/src/contexts

> React Native context providers: global state accessible from any component or route.

## Overview

Currently one context: `AuthContext.tsx`. Identical in purpose to the web frontend's `contexts/AuthContext.js`, adapted for React Native — AsyncStorage instead of localStorage, Expo Router navigation instead of React Router.

## How it works

1. `<AuthProvider>` wraps the app in `app/_layout.tsx`.
2. On mount, it reads the JWT from AsyncStorage. Valid token → set user state and navigate to tabs. Missing/expired → navigate to auth.
3. `login(token, user)` saves to AsyncStorage and updates state. `logout()` clears both.
4. Any component or route calls `useAuth()` to get `{ user, token, login, logout }`.

## Key files

| File | What it does |
|------|-------------|
| `AuthContext.tsx` | Context definition, `AuthProvider` component, `useAuth` hook |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/_layout.tsx` | Wraps entire app |
| Downstream | `src/api/client.ts` | Reads token for auth header |
| Downstream | `app/` routes | Read `user` for display; call `logout` |

## Gotchas

- AsyncStorage is async — on first mount there is a brief period where `token` is `null` even if the user is logged in. Show a splash/loading state rather than flashing the auth screen.

## Further reading

- [api/](../api/README.md)
- [../../../frontend/src/contexts/](../../../frontend/src/contexts/README.md) — web counterpart
