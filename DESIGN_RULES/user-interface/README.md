# user-interface

> Foundation layer: how to set up Slate, the design philosophy behind it, and the visual language rules every component follows.

## Overview

This section is the entry point for understanding the GoDutch Slate design system. It covers the tooling setup for the React Native app and the philosophy guides that define the visual language.

You do not need to read this section to use a specific component - go directly to [components/](../components/README.md) for that. Come here when you need to understand why a decision was made or when onboarding to the system from scratch.

## Contents

| File | What it covers |
|------|---------------|
| [setup.md](setup.md) | Import paths, NativeWind setup, and canonical mobile usage |
| [guides/](guides/README.md) | Color, typography, spacing, accessibility, adaptability, tonal topography, elevation |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream (callers) | All screens in `mobile/app/` | Read these docs before building screens |
| Downstream (deps) | `mobile/src/theme/tokens.ts` | Runtime implementation of color and spacing guides |

## Further reading

- [components/](../components/README.md) - individual component references
- [mobile/src/theme/tokens.ts](../../mobile/src/theme/tokens.ts) - design tokens
