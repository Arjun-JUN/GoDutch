# frontend/src/slate/components

> GoDutch-branded UI components: opinionated, design-system-compliant wrappers around shadcn/ui primitives.

## Overview

These are the building blocks pages actually use. Each component embeds the Alpine Ledger design decisions — pill-shaped buttons with primary gradient, surface-container-highest inputs, no-border cards with tonal elevation — so pages only pass data and behavior, never raw style.

New UI patterns start here. If a pattern from `ui/` needs GoDutch branding applied, wrap it here rather than styling it inline in a page.

## How it works

1. A page imports `AppButton` from `slate/`.
2. `AppButton` renders a `<button>` (or shadcn `Button`) with the correct Tailwind classes baked in.
3. Props control behavior (`onClick`, `disabled`, `loading`) but not appearance — appearance is owned by the component.

## Key files

| File | What it renders |
|------|----------------|
| `AppButton.js` | Pill-shaped button — primary (gradient), secondary (container), tertiary (text) variants |
| `AppField.js` | Labeled input — surface-container-highest background, xl rounded corners, focus ring |
| `AppSelect.js` | Styled dropdown — matches AppField aesthetics |
| `AppShell.js` | Page layout wrapper — sets max-width, padding, background |
| `AppSurface.js` | Content card — ambient shadow, no border, tonal elevation via background |
| `Header.js` | Top navigation bar — app name, nav links, user avatar |
| `ExpenseCard.js` | Expense list item — merchant, amount, split summary, category chip |
| `InDevelopmentOverlay.js` | "Coming soon" overlay for in-progress features |
| `index.js` | Barrel re-export |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `pages/` | Import and use |
| Downstream | `../ui/` | Delegate to shadcn/ui primitives for accessibility |
| Downstream | Tailwind | Class-based styling |

## Gotchas

- `AppSurface` uses `box-shadow` for elevation rather than borders — do not add `border` props or classes to it.
- `ExpenseCard` is stateless — it receives all display data as props. Interaction state (hover, loading) is self-contained.

## Further reading

- [ui/](../ui/README.md)
- [../../../../DESIGN_RULES/components/README.md](../../../../DESIGN_RULES/components/README.md) — component reference (canonical: mobile/src/slate/)
- [../../../../DESIGN_RULES/user-interface/legacy-web.md](../../../../DESIGN_RULES/user-interface/legacy-web.md) — this web layer is frozen
