# New Features

> **Status: Not implemented yet.**

Patterns for announcing feature launches to existing users.

## Channels

| Channel | When to use | Slate component |
|---------|-------------|----------------|
| In-app modal (bottom sheet) | Major feature launch, first session after update | `AppBottomSheet` + `PageHero` |
| In-app banner (callout) | Minor feature or improvement | `Callout` with `tone="info"` |
| Push notification | Feature that requires action (e.g. "Try the new smart split") | Expo Notifications |
| Bell tray item | Passive announcement, non-urgent | `NotificationTray` (see [bell-notifications.md](bell-notifications.md)) |

## Announcement modal pattern

For major launches, show a full bottom sheet on first open after the app update:

```tsx
// Pseudo-code — NewFeatureModal not yet a Slate component
<AppBottomSheet ref={sheetRef} snapPoints={['55%']} title="">
  <PageHero
    eyebrow="WHAT'S NEW"
    title="Smart Receipt Splitting"
    description="Scan any receipt and AI will split items per person automatically."
  />
  <AppButton variant="primary" size="lg" onPress={tryFeature}>
    Try it now
  </AppButton>
  <AppButton variant="ghost" size="md" onPress={dismiss}>
    Maybe later
  </AppButton>
</AppBottomSheet>
```

## Copy rules

- Eyebrow: `"WHAT'S NEW"` — always the same, caps via `eyebrow` variant.
- Title: one feature name, 3–5 words, Title Case.
- Description: two sentences max. What it does. Why it saves time.
- CTA: action verb + object ("Try it now", "Scan a receipt") — not "Learn more."

## Further reading

- [bell-notifications.md](bell-notifications.md)
- [../components/bottom-sheet/](../components/bottom-sheet/README.md)
