# Foundational Principles

> The four pillars every frontend change must honor. If a change does not satisfy this checklist, it is not done.

## Why this doc exists

The rest of `DESIGN_RULES/` tells you *how* to build a specific component. This doc tells you what is **true across every screen, every component, every change** — the principles a user can feel even when they can't name them. If you only read one doc in `DESIGN_RULES/`, read this one, then pull the leaf you need.

## The four pillars

1. **[Affordances & Signifiers](#1-affordances--signifiers)** — the UI telegraphs what is clickable, grouped, active, and disabled
2. **[Visual Hierarchy](#2-visual-hierarchy)** — the eye lands on the most important thing first
3. **[Interaction & Feedback](#3-interaction--feedback)** — every action gets a response; silent success is a bug
4. **[Technical Execution](#4-technical-execution)** — grids are honored, text on imagery is readable

---

## 1. Affordances & Signifiers

> The UI communicates its own structure without words. Grouping says "these belong together." Active says "you chose this." Disabled says "not now."

### Rules

- **Group related controls in a shared container.** If three chips toggle between food categories, a shared background or soft surface signals they are one choice. Unrelated items sit outside the container.
- **Active state uses more than color.** Add a second signifier — a filled background, a weight boost, a check-mark, a tonal shift — so the state is readable without color perception.
- **Disabled uses more than opacity.** Pair the 60% opacity drop with desaturation or a muted tone. Opacity alone looks like a loading state; users need to know it won't respond.
- **Prefer icon over text when the icon alone communicates.** A `→` between two place names reads faster than "from … to …". Use text when the meaning is not already in the icon vocabulary.
- **Every tap target has a press affordance.** Either a scale-spring (`AppButton`) or a tonal shift (`InteractiveSurface`). No dead taps.

### Why it matters

Affordances are how non-technical users navigate without a manual. A colorblind user, a user in bright sunlight, a user on a shaky train — they all have to see state from structure, not just color.

→ Detail: [`components/affordances-and-signifiers.md`](../../components/affordances-and-signifiers.md) · [`components/interaction-states.md`](../../components/interaction-states.md) · [`tonal-topography.md`](tonal-topography.md)

---

## 2. Visual Hierarchy

> The most important thing is the biggest, boldest, or most accented. Secondary detail is subordinate — visibly and structurally.

### Rules

- **Primary info dominates.** On an expense row, the merchant name and the amount are the primary read. Size, weight, or accent color must reflect that.
- **Secondary info is subordinate.** Dates, meta, group names — small font, low opacity, `tone="subtle"`. Never competing with the primary.
- **Color is a signal, not decoration.** Reserve `colors.primary`, `colors.danger`, `colors.success` for information the eye must find first (amounts, balances, state). Everything else is the neutral tonal palette.
- **Use `Text` variants, not custom `fontSize`/`fontWeight`.** The variants encode the hierarchy; raw styles break it. Prefer `variant="titleLg"` + `tone="default"` over inline `{ fontSize: 22, fontWeight: '700' }`.
- **Photo with text needs a readability overlay.** Gradient or progressive blur. Contrast ratio ≥ 4.5:1. See pillar 4.

### Why it matters

A user should be able to scan a screen in half a second and know what it's about. Hierarchy is what lets them. When everything is bold, nothing is.

→ Detail: [`typography.md`](typography.md) · [`color.md`](color.md) · [`components/text/`](../../components/text/README.md)

---

## 3. Interaction & Feedback

> Every action has a response. Press is immediate. Success is visible. Failure is recoverable.

### Rules

- **Five states per interactive element.** Every button, row, and tap target must be designed for: *default*, *pressed*, *disabled*, *loading*, and *focus-for-a11y* (screen-reader focus indicator). If any state is missing, the element is incomplete.
- **Confirmation is mandatory on user actions that matter.** Create, save, send, copy, settle — these must surface a visible confirmation (toast, slide-up chip, check-mark animation). Silent success is a bug.
- **Haptics on primary actions.** `Haptics.selectionAsync()` on every primary CTA, tab switch, and destructive confirmation. Light, not heavy — users should barely notice until it's absent.
- **Respect reduced-motion.** Every animation checks `AccessibilityInfo.isReduceMotionEnabled()` and renders the final state immediately when enabled.
- **Loading replaces content, does not dim it.** A button that's loading shows a spinner *instead of* its label — not a dimmed version of it.

### Why it matters

Feedback turns a screen into a conversation. Users need to know their tap landed, their save worked, their copy went through. A silent UI breeds anxiety and retries.

→ Detail: [`components/interaction-states.md`](../../components/interaction-states.md) · [`components/buttons/`](../../components/buttons/README.md)

---

## 4. Technical Execution

> The grid is 4. Text on imagery is readable. Spacing comes from tokens, not from guesses.

### Rules

- **Every spacing value is a multiple of 4, from the token module.** `spacing.xs/sm/md/lg/xl/2xl/3xl/breath`. Never `gap: 12`, `padding: 20`, `margin: 6`. If the token set doesn't have what you need, you don't need it — pick the nearest token.
- **Text over imagery gets a readability overlay.** `LinearGradient` (dark-to-transparent) or progressive blur behind the text region. Target contrast ≥ 4.5:1 against the darkest plausible photo region.
- **No `1px` borders for section separation.** Use tonal shift (`colors.soft`, `surfaceSolid`) instead. `borderGhost` exists for the rare case accessibility demands a literal line.
- **Corners are pill-shaped.** `radii.sm` (2px) minimum; buttons use `radii.pill` (999). No sharp 0-radius corners.
- **Colors from the palette, not hex strings.** Import from `@/theme/tokens`. A hex literal in a component file is a bug.

### Why it matters

Execution invariants make the difference between a design system and a set of suggestions. When every spacing is on grid and every surface is from the palette, the product feels built by one hand.

→ Detail: [`spacing-and-rhythm.md`](spacing-and-rhythm.md) · [`readability-overlays.md`](readability-overlays.md) · [`color.md`](color.md) · [`elevation-and-luminosity.md`](elevation-and-luminosity.md)

---

## Pre-ship checklist

Before marking any frontend change done, walk this list. Every box must be true.

**Affordances & Signifiers**
- [ ] Related controls share a container; unrelated ones don't
- [ ] Active state uses a non-color signifier (weight, fill, check)
- [ ] Disabled uses opacity **and** desaturation/mute
- [ ] Every tap target has a press affordance (scale or tonal shift)

**Visual Hierarchy**
- [ ] Primary info is visibly dominant (size, weight, or accent color)
- [ ] Secondary info uses `tone="subtle"` or `variant="label"`
- [ ] Accent colors (primary, danger, success) are used only for must-see info
- [ ] No raw `fontSize` / `fontWeight` — `Text` variants only

**Interaction & Feedback**
- [ ] All five states implemented (default, pressed, disabled, loading, a11y-focus)
- [ ] User actions that mutate state show a confirmation (toast/chip/check)
- [ ] Primary CTAs trigger haptics
- [ ] Animations honor `reduce-motion`
- [ ] Loading replaces content (not dims it)

**Technical Execution**
- [ ] All spacing is from `spacing.*` tokens (no raw numbers)
- [ ] All colors are from `colors.*` tokens (no hex literals)
- [ ] Text over imagery has a readability overlay (gradient or blur)
- [ ] No `1px` borders for separation
- [ ] Radii from `radii.*` tokens

**Proof**
- [ ] Tests cover every interaction state and the confirmation path
- [ ] `pnpm test --coverage` passes; touched files ≥ 90%
- [ ] `pnpm typecheck` and `pnpm lint` clean
- [ ] Folder READMEs updated for every folder touched

## Further reading

- [../../README.md](../../README.md) — DESIGN_RULES index
- [tonal-topography.md](tonal-topography.md) — the no-line rule
- [spacing-and-rhythm.md](spacing-and-rhythm.md) — the 4-point grid
- [typography.md](typography.md) — editorial voice
- [readability-overlays.md](readability-overlays.md) — text on imagery
- [../../components/affordances-and-signifiers.md](../../components/affordances-and-signifiers.md)
- [../../components/interaction-states.md](../../components/interaction-states.md)
