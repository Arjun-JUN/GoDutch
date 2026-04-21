# DESIGN_RULES

> The GoDutch Slate design system — a calm, editorial language for transparent expense splitting.

**Core philosophy:** "The Mindful Ledger." Treat expense splitting as a calm, transparent dialogue, not an aggressive alert-driven chore. Achieve separation through tonal shifts and generous space — never 1px borders.

## Start here

**[user-interface/guides/foundational-principles.md](user-interface/guides/foundational-principles.md)** — the four pillars (affordances, hierarchy, feedback, execution) and the pre-ship checklist every frontend change must pass. Read this before anything else.

## How to use this index

Pull only the leaf you need. When working on a specific component or pattern, open only that file:

| Task | Open |
|------|------|
| **Shipping any frontend change** | **[user-interface/guides/foundational-principles.md](user-interface/guides/foundational-principles.md)** |
| Affordances, signifiers, grouping, active/disabled states | [components/affordances-and-signifiers.md](components/affordances-and-signifiers.md) |
| Text over imagery (gradients, blur) | [user-interface/guides/readability-overlays.md](user-interface/guides/readability-overlays.md) |
| Building or styling a button | [components/buttons/](components/buttons/README.md) |
| Adding a bottom sheet / modal | [components/bottom-sheet/](components/bottom-sheet/README.md) |
| Displaying text | [components/text/](components/text/README.md) |
| Building a form | [components/forms.md](components/forms.md) |
| Icons | [components/icons.md](components/icons.md) |
| Page layout (AppShell + PageHero) | [components/shell/](components/shell/README.md) |
| Screen header | [components/header/](components/header/README.md) |
| Surface / card | [components/surfaces/](components/surfaces/README.md) |
| Expense list item | [components/expense-card/](components/expense-card/README.md) |
| Icon badges, avatars, stat cards, empty states | [components/atoms/](components/atoms/README.md) |
| Colors and tokens | [user-interface/guides/color.md](user-interface/guides/color.md) |
| Typography scale | [user-interface/guides/typography.md](user-interface/guides/typography.md) |
| Spacing rules | [user-interface/guides/spacing-and-rhythm.md](user-interface/guides/spacing-and-rhythm.md) |
| No-line rule / surface hierarchy | [user-interface/guides/tonal-topography.md](user-interface/guides/tonal-topography.md) |
| Shadows and depth | [user-interface/guides/elevation-and-luminosity.md](user-interface/guides/elevation-and-luminosity.md) |
| Accessibility | [user-interface/guides/accessibility.md](user-interface/guides/accessibility.md) |
| Dashboard patterns (nav, tables, pages) | [slate-for-dashboard/](slate-for-dashboard/README.md) |
| Notifications, feature discovery | [communicating-with-users/](communicating-with-users/README.md) |
| Setup / imports | [user-interface/setup.md](user-interface/setup.md) |
| Web (legacy) | [user-interface/legacy-web.md](user-interface/legacy-web.md) |

## Sections

- **[user-interface/](user-interface/README.md)** — setup, guides (color, type, spacing, accessibility, adaptability)
- **[communicating-with-users/](communicating-with-users/README.md)** — notifications, feature discovery, in-app messaging
- **[slate-for-dashboard/](slate-for-dashboard/README.md)** — page templates, navigation, tables, drawers, filtering
- **[components/](components/README.md)** — every shipped and planned Slate component

## The five non-negotiable rules

1. **No-line rule** — never a `1px` border to separate sections. Use background color shifts instead.
2. **Tonal hierarchy** — surface → surface-container-low → surfaceSolid (white). 3% luminance is enough.
3. **Pill shapes** — no sharp corners. Minimum radius `sm` (2px) everywhere; buttons are fully rounded (`pill: 999`).
4. **Generous breath** — lean toward more space. When in doubt, add a `<Breath />` or use `spacing.breath` (88px).
5. **Editorial voice** — size-first typography hierarchy, Manrope, tight letter-spacing on display elements.
