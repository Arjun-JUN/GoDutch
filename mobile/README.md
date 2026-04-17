# mobile

> React Native (Expo) mobile application for GoDutch — iOS and Android client.

## Overview

This is the iOS/Android client. Built with Expo SDK + Expo Router for file-based navigation, React Native, and NativeWind (Tailwind for React Native). State is managed with Zustand stores in `src/stores/`. The mobile app is a feature-equivalent companion to the web frontend — same backend API, same design language, native feel.

## How it works

1. Expo loads `app/_layout.tsx` as the root layout.
2. `_layout.tsx` wraps the app with `<AuthProvider>` and a root `<Stack>` navigator.
3. If no token exists, `app/index.tsx` redirects to `app/auth.tsx`.
4. After login, the user lands on `app/(tabs)/dashboard.tsx`.
5. Zustand stores hydrate on first use by calling `src/api/client.ts`.

## Key files

| File | What it does |
|------|-------------|
| `app.json` | Expo config — app name, bundle ID, permissions |
| `babel.config.js` | NativeWind and Expo Router transforms |
| `jest.config.js` | Jest config for React Native |
| `tailwind.config.js` | Tailwind config for NativeWind (matches web tokens) |
| `global.css` | NativeWind base styles |
| `app/` | File-based routes (Expo Router) |
| `src/` | Business logic, state, components, utilities |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | iOS / Android OS | Native app launch |
| Downstream | `backend/` | HTTP REST via `src/api/client.ts` |
| Downstream | Device camera | `expo-image-picker` for receipt scanning |
| Downstream | UPI apps | Deep link (`upi://`) for payment |

## Gotchas

- `expo-image-picker` uses `MediaType` (not the deprecated `MediaTypeOptions`) as of the current version.
- NativeWind class names must match the Tailwind config exactly — no arbitrary values that aren't in the safelist.
- `API_BASE_URL` in `.env.local` must be the machine's LAN IP when running on a physical device — `localhost` won't work.

## Further reading

- [app/](app/README.md) — file-based routes
- [src/api/](src/api/README.md) — HTTP client
- [src/stores/](src/stores/README.md) — Zustand state
- [src/slate/](src/slate/README.md) — mobile design system
