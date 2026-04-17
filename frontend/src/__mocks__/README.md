# frontend/src/__mocks__

> Vitest manual mocks for dependencies that can't run in jsdom.

## Overview

jsdom (the browser environment used in tests) does not support CSS animations or the Web Animations API. Framer-motion uses both, so importing any component that uses it in a test crashes. This mock replaces all framer-motion exports with pass-through React components so tests render correctly.

## Key files

| File | What it mocks |
|------|--------------|
| `framer-motion.js` | Replaces `motion.*`, `AnimatePresence`, etc. with plain `<div>` wrappers |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | Vitest | Automatically used when `framer-motion` is imported in a test file |
| Downstream | None | Static — no calls out |

## Gotchas

- If you add a new framer-motion export (e.g. `useAnimation`, `useMotionValue`), add it to this mock or tests that use it will crash with "not a function" errors.

## Further reading

- [__tests__/](../__tests__/README.md)
