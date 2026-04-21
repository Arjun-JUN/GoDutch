# Interaction States

> How GoDutch components communicate press, focus, disabled, and loading states — without borders or bright colors.

## The five states — every interactive element must design for all of them

| # | State | Visual signal | How it's implemented |
|---|-------|--------------|---------------------|
| 1 | **Default** | Resting background + shadow | Base component style |
| 2 | **Pressed** | Scale spring + tonal bg shift | Reanimated `withSpring(0.97)` + pressed bg |
| 3 | **Disabled** | 60% opacity **+ tonal mute** | `opacity: 0.6` + swap to `colors.soft` / `mutedSubtle` |
| 4 | **Loading** | Spinner replaces content | `ActivityIndicator` inside button |
| 5 | **Focus-for-a11y** | System focus ring | Default `Pressable` + correct `accessibilityRole` and `accessibilityState` |

If any state is missing, the component is incomplete. Mobile has no hover — state 5 covers screen-reader focus only, but it is still a real state and depends on correct `accessibilityRole` + `accessibilityState`.

## Press feedback

GoDutch uses two complementary press signals:

### 1. Scale spring (AppButton)
```
onPressIn → scale → 0.97 (spring: damping 18, stiffness 300)
onPressOut → scale → 1.0
```
Implemented in `AppButton` via `Animated.createAnimatedComponent(Pressable)` + `useSharedValue`.

### 2. Background tonal shift (InteractiveSurface, ExpenseCard, Pressable rows)
```
pressed → backgroundColor: colors.soft (#f0f4f3)
resting → backgroundColor: colors.surfaceSolid (#ffffff)
```
No hard border appears — the tonal shift alone signals the interaction.

## Disabled state

Disabled elements drop to 60% opacity **and** swap to the muted tonal palette (`colors.soft` background, `colors.mutedSubtle` text). Opacity alone reads as loading; the tonal mute is what tells the user "not now."

```tsx
const disabledStyle = isDisabled ? {
  opacity: 0.6,
  backgroundColor: colors.soft,
  color: colors.mutedSubtle,
  shadowOpacity: 0,       // drop the lift
} : null;
```

Do not remove the element from the tree when disabled — accessibility tools should still be able to see it and read its label. Set `accessibilityState={{ disabled: true }}` so VoiceOver/TalkBack announce the state.

See [affordances-and-signifiers.md](affordances-and-signifiers.md#disabled--more-than-opacity) for why opacity alone is not enough.

## Loading state

When an async action is in progress, replace button content with a spinner:

```tsx
<AppButton variant="primary" size="md" loading={isSubmitting} onPress={handleSubmit}>
  Save
</AppButton>
// Shows ActivityIndicator instead of "Save" text
// Automatically disabled while loading
```

Spinner color:
- `primary` / `danger` variant: `colors.primaryForeground`
- `secondary` / `ghost` variant: `colors.primary`

## Reduced motion

Both `AppButton` (Reanimated scale) and `PageHero` (FadeInDown) check the OS reduce-motion setting. When enabled, animations are skipped and components render in their final state immediately.

```tsx
// AppButton implementation (reference)
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
  return () => sub.remove();
}, []);

// Before animating:
if (!reducedMotion && !isDisabled) {
  scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
}
```

## Haptic feedback

`AppButton variant="primary"` triggers `Haptics.selectionAsync()` on press by default. Pass `haptic={false}` to disable.

Other interactive elements (e.g. tab presses, row selections) can add haptic via:
```tsx
import * as Haptics from 'expo-haptics';
Haptics.selectionAsync(); // light tap
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // medium bump
```

## Confirmation micro-interactions — silent success is a bug

Every user action that **mutates state** (create, save, send, settle, copy) must surface a visible confirmation. A silent navigation away from a form is indistinguishable from a crash — the user is left wondering whether it worked.

Use one of three confirmation patterns, chosen by context:

### 1. Toast / confirmation chip (ephemeral)

Slide up from the bottom, visible for 2–3 seconds, dismisses itself. Right for: "Copied!", "Group created", "Expense saved", "Settled ₹500".

```tsx
import { Toast } from '@/slate';

function CreateGroup() {
  const [toast, setToast] = useState<string | null>(null);
  const onCreate = async () => {
    await api.createGroup(...);
    setToast('Group created');
    // optional: navigate after the toast has had time to read
    setTimeout(() => router.replace(`/groups/${id}`), 400);
  };
  return (
    <>
      <AppButton onPress={onCreate}>Create</AppButton>
      <Toast message={toast} onHide={() => setToast(null)} />
    </>
  );
}
```

Toast rules:
- **Slide-up** from the bottom safe area, with a spring.
- **Auto-dismiss** in 2–3 seconds. Do not require a tap.
- **One at a time.** Queue or replace, never stack.
- **Respect reduce-motion.** When reduced-motion is on, fade instead of slide.
- **A11y live region** — `accessibilityLiveRegion="polite"` so screen readers announce the confirmation.

### 2. Inline check-mark animation

For actions scoped to a single element (copy-to-clipboard, favorite, mark-as-paid), animate a check-mark in place of the action icon for 1.5 seconds, then revert.

```tsx
const [copied, setCopied] = useState(false);
const onCopy = () => {
  Clipboard.setString(email);
  setCopied(true);
  Haptics.selectionAsync();
  setTimeout(() => setCopied(false), 1500);
};
return (
  <Pressable onPress={onCopy}>
    {copied ? <CheckIcon color={colors.success} /> : <CopyIcon />}
  </Pressable>
);
```

### 3. State swap (permanent)

For actions that leave a visible permanent change on screen (settling an expense and the row moves to the "settled" section), the state change itself is the confirmation. Still pair with a haptic so the user feels the commit.

## Rules

- **Every mutation gets one of the three patterns.** Never silent success.
- **Confirmation fires *after* the server acknowledges**, not optimistically, unless the UI also has explicit rollback.
- **Don't block the user.** Toast does not gate further interaction; navigation can proceed behind it.
- **Failure gets the same treatment in reverse.** A red toast ("Couldn't save — try again") for errors. Do not surface error-only; success and failure are both required.

## Further reading

- [buttons/](buttons/README.md)
- [surfaces/](surfaces/README.md)
- [../../user-interface/guides/accessibility.md](../../user-interface/guides/accessibility.md)
