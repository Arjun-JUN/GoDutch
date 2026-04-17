# Bell Notifications

> **Status: Not implemented yet.**

Push and in-app notification patterns for GoDutch.

## Why it's here

Expense apps live or die by timely notifications: "You were added to a trip," "Arjun settled their share," "You have an outstanding balance." These must be calm and actionable, not spammy.

## Target behavior

- **Push notifications** via Expo Notifications (`expo-notifications`).
- **In-app notification tray** accessible via a bell icon in the header (tab bar or `Header` right slot).
- **Unread badge** on the bell icon — integer count, not a red dot — to match the calm palette.

## Target API (not yet built)

```tsx
// Notification tray sheet
import { NotificationTray } from '@/slate';

// In a screen's header right slot:
<Header
  title="Dashboard"
  right={
    <NotificationBell unread={3} onPress={openTray} />
  }
/>

// The tray itself
<NotificationTray
  notifications={[
    { id: '1', type: 'settlement', title: 'Arjun settled ₹840', time: '2 min ago' },
    { id: '2', type: 'added_to_group', title: 'You were added to "Goa Trip"', time: '1h ago' },
  ]}
  onDismiss={handleDismiss}
/>
```

## Notification types to support

| Type | Trigger | Action on tap |
|------|---------|--------------|
| `settlement` | A settlement is recorded | Open expense detail |
| `added_to_group` | User added to a group | Open group detail |
| `balance_reminder` | Outstanding balance > 7 days | Open balance screen |
| `expense_added` | New expense in a shared group | Open expense detail |

## Design rules

- Use `Callout` (`tone="info"`) for inline notification rows in the tray.
- Badge count uses `Text variant="label"` on a `primary` background circle.
- No bright red badge — use `colors.primary` (#4e635a) for unread count.
- Tray is delivered as an `AppBottomSheet`.

## Further reading

- [../components/atoms/](../components/atoms/README.md) — `Callout` component
- [../components/bottom-sheet/](../components/bottom-sheet/README.md) — sheet for the tray
