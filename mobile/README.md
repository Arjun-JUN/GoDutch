# mobile

> React Native (Expo) mobile application for GoDutch on iOS and Android.

## Overview

This is the primary product surface in the repo. It is built with Expo SDK, Expo Router for file-based navigation, React Native, and NativeWind, with Zustand stores in `src/stores/` coordinating local app state and backend data.

The mobile app talks directly to the FastAPI backend and uses the Slate component library in `src/slate/` to keep the product UI consistent.

## How it works

1. Expo loads `app/_layout.tsx` as the root layout.
2. The root layout mounts auth context and the main router stack.
3. Unauthenticated users are redirected to `app/auth.tsx`.
4. Authenticated users land in the tab navigator under `app/(tabs)/`.
5. Screens fetch and mutate data through `src/api/client.ts` and the Zustand stores.

## Key files

| File | What it does |
|------|-------------|
| `app.json` | Expo app configuration |
| `babel.config.js` | Expo Router and NativeWind transforms |
| `jest.config.js` | React Native test configuration |
| `tailwind.config.js` | NativeWind design token configuration |
| `global.css` | NativeWind base styles |
| `app/` | Expo Router screens and layouts |
| `src/` | API client, state, Slate UI, and utilities |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | iOS / Android runtime | app launch and lifecycle |
| Downstream | `backend/` | HTTP REST via `src/api/client.ts` |
| Downstream | Device camera and media library | `expo-image-picker` |
| Downstream | UPI apps | deep links such as `upi://` |

## Gotchas

- `expo-image-picker` uses `MediaType` rather than the older `MediaTypeOptions`.
- NativeWind class names must match the configured tokens and safelist.
- Physical-device testing usually needs a LAN API URL rather than `localhost`.
- Coverage output and scratch/debug scripts are local-only artifacts and should not be committed.

## Further reading

- [app/](app/README.md) - file-based routes
- [src/api/](src/api/README.md) - HTTP client
- [src/stores/](src/stores/README.md) - Zustand state
- [src/slate/](src/slate/README.md) - mobile design system
