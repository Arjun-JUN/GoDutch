# mobile/src/contexts

> React Native context providers: global state accessible from any component or route.

## Overview

Currently this folder contains `AuthContext.tsx`. It owns app-wide authentication state for the Expo client, using AsyncStorage for persistence and Expo Router for navigation.

## How it works

1. `<AuthProvider>` wraps the app in `app/_layout.tsx`.
2. On mount, it reads the JWT from AsyncStorage.
3. A valid token restores user state and keeps the user in the authenticated area.
4. `login(token, user)` persists auth state and `logout()` clears it.
5. Any component or route calls `useAuth()` to access `{ user, token, login, logout }`.

## Key files

| File | What it does |
|------|-------------|
| `AuthContext.tsx` | Context definition, `AuthProvider`, and `useAuth` hook |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/_layout.tsx` | Wraps the entire app |
| Downstream | `src/api/client.ts` | Reads token for auth headers |
| Downstream | `app/` routes | Reads `user` and calls `logout` |

## Gotchas

- AsyncStorage is async, so there is a brief startup period where auth state is still hydrating.

## Further reading

- [api/](../api/README.md)
