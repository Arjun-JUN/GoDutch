# Page Templates

> Standard screen compositions using `AppShell`, `PageHero`, and `PageContent`.

## The base template

Every GoDutch screen wraps its content in `AppShell` → `PageContent`. `PageHero` is added when the screen needs an editorial hero section.

```tsx
import { AppShell, PageContent, PageHero } from '@/slate';
import { ScrollView } from 'react-native';

export default function MyScreen() {
  return (
    <AppShell>
      {/* In-page header (back button, title, right action) */}
      <Header title="Group Detail" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <PageContent>
          <PageHero
            eyebrow="GOA TRIP"
            title="₹12,400"
            description="Split among 5 people"
          />
          {/* Screen-specific content */}
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
```

## Template variants

### 1. Full hero (primary screens)

Used on: Dashboard home, Group overview.

- `AppShell` (gradient bg)
- `Header` without back button (`showBack={false}`)
- `PageHero` with `compact={false}` (display-size title, max top margin)
- `ScrollView` → `PageContent`

### 2. Sub-screen (secondary screens)

Used on: Expense detail, Add Expense, Settings.

- `AppShell`
- `Header` with `showBack` + title centered
- `PageHero compact` or no hero (jump straight to content)
- `ScrollView` → `PageContent`

### 3. Modal screen (bottom sheet)

Used on: Split configuration, Paid-by picker, Settle confirmation.

- Not a full screen — uses `AppBottomSheet` with `SheetHeader`
- No `AppShell` (the parent screen handles the shell)

```tsx
<AppBottomSheet ref={sheetRef} title="Paid by" snapPoints={['50%']}>
  {/* pickers */}
</AppBottomSheet>
```

## AppShell props summary

| Prop | Default | When to change |
|------|---------|---------------|
| `edges` | `['top']` | `['top', 'bottom']` on tab root screens |
| `flat` | `false` | Set `true` for screens with a custom solid bg (e.g. camera screens) |

## PageContent props summary

| Prop | Default | Notes |
|------|---------|-------|
| `padded` | `true` | Set `false` when a child (like a list) needs edge-to-edge layout |

## Further reading

- [overview-page.md](overview-page.md)
- [list-page.md](list-page.md)
- [detail-page.md](detail-page.md)
- [../components/shell/](../components/shell/README.md)
