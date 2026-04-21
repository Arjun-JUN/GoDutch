# Toast

> Ephemeral confirmation chip that slides up from the bottom. The canonical answer to "silent success is a bug."

**Status:** Shipped · **Source:** `mobile/src/slate/Toast.tsx`

## Purpose

Every user action that mutates state — create, save, send, copy, settle — needs a visible confirmation. `Toast` is the default choice: it slides up, reads clearly, auto-dismisses in 2.4 seconds, and does not block further interaction. For inline, non-ephemeral status see `Callout`; for element-scoped confirmations use the inline check-mark pattern in [../interaction-states.md](../interaction-states.md#2-inline-check-mark-animation).

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `message` | `string \| null \| undefined` | required | Visible when truthy; hidden when falsy. Drives the mount/unmount transition. |
| `tone` | `'success' \| 'danger' \| 'neutral'` | `'success'` | `success` = green bg + check icon. `danger` = red bg + alert icon. `neutral` = dark foreground bg, no icon. |
| `durationMs` | `number` | `2400` | Auto-dismiss delay. Do not exceed 4000 — users scanning the screen shouldn't wait. |
| `onHide` | `() => void` | required | Called on auto-dismiss and on tap-to-dismiss. Parent must clear the `message` in response. |

## Import

```tsx
import { Toast } from '@/slate';
```

## Usage

```tsx
const [toast, setToast] = useState<string | null>(null);

const onCreate = async () => {
  await api.createGroup(input);
  setToast('Group created');
  // Optional: navigate after the toast has had time to read.
  setTimeout(() => router.replace(`/groups/${id}`), 400);
};

return (
  <>
    <AppButton onPress={onCreate}>Create group</AppButton>
    <Toast message={toast} onHide={() => setToast(null)} />
  </>
);
```

Error confirmation:

```tsx
try {
  await api.settleUp(id, amount);
  setToast({ text: 'Settled ₹500', tone: 'success' });
} catch (err) {
  setToast({ text: "Couldn't settle — try again", tone: 'danger' });
}
```

## Design rules honored

- **Silent success is a bug** — [`../interaction-states.md`](../interaction-states.md#confirmation-micro-interactions--silent-success-is-a-bug).
- **Respect reduce-motion** — slides up normally; fades in/out when OS reduce-motion is enabled.
- **A11y live region** — `accessibilityLiveRegion="polite"` so VoiceOver/TalkBack announce the message.
- **Pill-shaped** — `radii.pill` (999), consistent with buttons.
- **Ambient shadow** — `shadows.card`, no border (no-line rule).
- **One at a time** — the parent owns state and can queue or replace; the component does not stack.

## Gotchas

- Toast is a sibling of your screen content, not a child of a scrollable area. Mount it at the top of the screen tree (typically the page root under `AppShell`) so it floats over content.
- The parent **must** clear `message` in the `onHide` callback, otherwise the toast never re-appears on the next action (the useEffect compares `message` identity).
- On iOS, `accessibilityRole="alert"` will interrupt any VoiceOver speech in progress. That is the point — it must be heard.

## Further reading

- [../interaction-states.md](../interaction-states.md) — the full confirmation pattern catalog
- [../atoms/](../atoms/README.md) — `Callout` for non-ephemeral inline status
- [../../user-interface/guides/foundational-principles.md](../../user-interface/guides/foundational-principles.md) — pillar 3
