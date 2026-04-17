# frontend/src/hooks

> Custom React hooks for reusable stateful logic.

## Overview

One hook currently: `use-toast.js`, which wraps the Sonner toast library in a React-friendly API. Hooks here follow the `use-` naming convention and are kept small — if a hook grows complex, it should be split or moved closer to the feature it serves.

## Key files

| File | What it does |
|------|-------------|
| `use-toast.js` | Returns `{ toast }` — a function that triggers a Sonner toast notification |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `pages/` | Call `toast(message, options)` after mutations |
| Downstream | `sonner` | Renders the notification |

## Further reading

- [slate/ui/sonner.jsx](../slate/ui/README.md)
