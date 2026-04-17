# AppShell / PageContent / PageHero

> Screen structure: gradient wrapper, safe area, horizontal padding, and the editorial hero section.

**Status:** Shipped  
**Sources:** `mobile/src/slate/AppShell.tsx`, `mobile/src/slate/PageHero.tsx`

## Components

- **`AppShell`** — full-screen wrapper with gradient background + `SafeAreaView`.
- **`PageContent`** — scrollable content area with consistent 24px horizontal padding.
- **`PageHero`** — editorial hero section with eyebrow, display title, description, and actions.

## AppShell props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `edges` | `Edge[]` | `['top']` | Safe area edges to apply; pass `['top','bottom']` on tab root screens |
| `flat` | `boolean` | `false` | Disables gradient; uses flat `backgroundStart` (#f8faf9) instead |
| `className` | `string` | — | Applied to the inner `SafeAreaView` |
| `style` | `ViewStyle` | — | |

All other `ViewProps` are spread onto the `SafeAreaView`.

## PageContent props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `padded` | `boolean` | `true` | Applies `px-6` (24px) horizontal padding; set `false` for edge-to-edge lists |
| `className` | `string` | — | |

All other `ViewProps` are spread.

## PageHero props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `eyebrow` | `string` | — | Animated in first; renders as `Text variant="eyebrow" tone="primary"` |
| `title` | `string \| ReactNode` | required | String → `Text variant="display"` (or `titleXl` if `compact`). Pass a ReactNode for custom display. |
| `description` | `string` | — | Body text below title, `tone="muted"` |
| `actions` | `ReactNode` | — | Button row below description, rendered in a `flexDirection: 'row'` with `gap: 12` |
| `compact` | `boolean` | `false` | `true` → uses `titleXl` instead of `display`, reduces top/bottom margins |

## Sample code

```tsx
import { AppShell, PageContent, PageHero } from '@/slate';

// Full-screen page with hero
export default function GroupScreen() {
  return (
    <AppShell>
      <Header title="Goa Trip" showBack />
      <ScrollView>
        <PageContent>
          <PageHero
            eyebrow="GOA TRIP"
            title="₹12,400"
            description="Split among 5 people · 8 expenses"
            actions={
              <>
                <AppButton variant="primary" size="md" onPress={handleAddExpense}>Add Expense</AppButton>
                <AppButton variant="secondary" size="md" onPress={handleSettle}>Settle Up</AppButton>
              </>
            }
          />
          {/* rest of screen */}
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}

// Compact hero for sub-screens
<PageHero
  eyebrow="EXPENSE"
  title="Dinner at Toit"
  description="12 Apr 2025 · 4 people"
  compact
/>

// Flat shell (e.g. camera screen)
<AppShell flat>
  {/* content with custom bg */}
</AppShell>

// Tab root screen (both top and bottom safe areas)
<AppShell edges={['top', 'bottom']}>
  {/* tab content */}
</AppShell>
```

## Hero animation

`PageHero` uses `react-native-reanimated`'s `FadeInDown` with staggered delays:
- Eyebrow: delay 0, 300ms
- Title: delay 60ms, 350ms
- Description: delay 120ms, 400ms
- Actions: delay 180ms, 400ms

Reanimated respects `reduceMotion` automatically in RN 0.72+.

## Design rules honored

- Gradient background (`backgroundStart` → `backgroundEnd`) via `AppShell`
- "Generous breath" — `PageHero` applies `marginTop: 24` (non-compact) or `16` (compact)
- `display` variant for primary hero titles — largest type on screen
- Eyebrow auto-uppercases via `Text variant="eyebrow"`

## Related

- [../header/](../header/README.md)
- [../../slate-for-dashboard/page-templates.md](../../slate-for-dashboard/page-templates.md)
- [../../user-interface/guides/spacing-and-rhythm.md](../../user-interface/guides/spacing-and-rhythm.md)
