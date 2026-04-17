# Settings

> **Status: Not implemented yet.**

Pattern for a settings screen with grouped options.

## Pattern intent

Settings screens in GoDutch should feel like an extension of the design language — not a plain list of `Switch` rows like a system settings menu. Each settings group is an `AppSurface` card. Within it, rows use `Text` + `MemberBadge` / `Switch` with no divider lines.

## Target pattern

```tsx
import { AppShell, PageContent, Header, AppSurface } from '@/slate';
import { Text } from '@/slate';
import { View, Switch } from 'react-native';
import { Breath } from '@/slate/atoms';
import { colors } from '@/theme/tokens';

export default function SettingsScreen() {
  return (
    <AppShell>
      <Header title="Settings" showBack />
      <ScrollView>
        <PageContent>
          <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>Account</Text>
          <AppSurface variant="solid">
            <SettingsRow label="Display name" value={user.name} onPress={editName} />
            <SettingsRow label="Currency" value="INR" onPress={editCurrency} />
          </AppSurface>

          <Breath size="sm" />

          <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>Preferences</Text>
          <AppSurface variant="solid">
            <SettingsToggle label="Haptic feedback" value={haptics} onChange={setHaptics} />
            <SettingsToggle label="Push notifications" value={notifications} onChange={setNotifications} />
          </AppSurface>
        </PageContent>
      </ScrollView>
    </AppShell>
  );
}
```

## SettingsRow (to be built)

A row component that displays a label + value/chevron, with a tonal press state:

| Prop | Type | Notes |
|------|------|-------|
| `label` | string | Left-side label |
| `value` | string | Right-side value (optional) |
| `onPress` | `() => void` | Opens a picker or input sheet |

## SettingsToggle (to be built)

Label + system `Switch` (styled with `colors.primary` track color):

| Prop | Type | Notes |
|------|------|-------|
| `label` | string | Row label |
| `value` | boolean | Current toggle state |
| `onChange` | `(v: boolean) => void` | State updater |

## Rules

- Group settings by topic using `AppSurface` cards with `eyebrow` section labels above each.
- No divider lines between rows — use padding within the card.
- Destructive settings (delete account, sign out) go in their own card at the bottom with `danger` tone.

## Further reading

- [page-templates.md](page-templates.md)
- [../components/surfaces/](../components/surfaces/README.md)
