# mobile/src

> Non-routing source: API client, state stores, design system, utilities, and feature components.

## Overview

Everything in `mobile/app/` (the routes) depends on things defined here. This separation keeps route files thin — they compose from `src/` rather than embedding logic. Adding a new feature typically means adding a store in `stores/`, types in `stores/types.ts`, and components in `slate/` or `components/`, then wiring them in `app/`.

## Subdirectories

| Directory | What it contains |
|-----------|-----------------|
| `api/` | HTTP client for all backend calls |
| `contexts/` | AuthContext — global user identity |
| `stores/` | Zustand stores — expenses, groups, settlements |
| `slate/` | Mobile design system components |
| `components/` | Feature-specific compound components |
| `utils/` | Arithmetic, splitting algorithms, constants |
| `theme/` | Design tokens (colors, spacing, typography) |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `app/` (routes) | Import stores, components, API client |
| Downstream | `backend/` | HTTP via `api/client.ts` |
| Downstream | React Native | Native component primitives |

## Further reading

- [api/](api/README.md)
- [stores/](stores/README.md)
- [slate/](slate/README.md)
- [components/](components/README.md)
- [utils/](utils/README.md)
- [theme/](theme/README.md)
