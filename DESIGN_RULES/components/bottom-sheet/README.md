# AppBottomSheet / SheetHeader

> The mobile-native replacement for modals — gesture-driven, snappable, with a Slate-styled handle.

**Status:** Shipped · **Source:** `mobile/src/slate/AppBottomSheet.tsx`  
**Underlying library:** `@gorhom/bottom-sheet`

## When to use

Use `AppBottomSheet` for:
- **Pickers** — "Paid by" selector, split method picker
- **Configuration panels** — item assignment, member selection
- **Confirmation dialogs** — settle confirmation, delete confirmation
- **Contextual action menus** — see [object-drawer](../../slate-for-dashboard/object-drawer.md)

Do not use for primary content screens — those are full-screen pages.

## Usage pattern

`AppBottomSheet` wraps `BottomSheetModal`, which requires a `ref` to `present()`/`dismiss()`.

```tsx
import { useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppBottomSheet, SheetHeader, AppButton } from '@/slate';

export function PaidBySheet({ onSelect }) {
  const sheetRef = useRef<BottomSheetModal>(null);

  return (
    <>
      {/* Trigger */}
      <AppButton variant="secondary" onPress={() => sheetRef.current?.present()}>
        Change payer
      </AppButton>

      {/* Sheet */}
      <AppBottomSheet ref={sheetRef} title="Paid by" description="Who paid for this expense?" snapPoints={['45%']}>
        {members.map((m) => (
          <AppButton key={m.id} variant="ghost" onPress={() => { onSelect(m); sheetRef.current?.dismiss(); }}>
            {m.name}
          </AppButton>
        ))}
      </AppBottomSheet>
    </>
  );
}
```

## AppBottomSheet props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `snapPoints` | `(string \| number)[]` | `['60%', '90%']` | Height snap positions |
| `title` | `string` | — | Sheet title (`Text variant="titleLg"`) |
| `description` | `string` | — | Subtitle below title (`Text variant="body" tone="muted"`) |
| `scrollable` | `boolean` | `true` | Wraps children in `BottomSheetScrollView`; set `false` for fixed-height content |

All other `BottomSheetModalProps` are spread.

## SheetHeader props

Use `SheetHeader` instead of the `title` prop when you need a right-side action alongside the title:

| Prop | Type | Notes |
|------|------|-------|
| `title` | `string` | Required |
| `onClose` | `() => void` | Renders an `×` icon button |
| `action` | `ReactNode` | Extra slot before the close button |

```tsx
<AppBottomSheet ref={sheetRef} snapPoints={['50%']} scrollable={false}>
  <SheetHeader
    title="Add item"
    onClose={() => sheetRef.current?.dismiss()}
    action={<AppButton variant="ghost" size="sm" onPress={handleSave}>Save</AppButton>}
  />
  {/* content */}
</AppBottomSheet>
```

## Design details

- Background: `colors.surfaceSolid` (#ffffff), `borderTopRadius: 32`
- Handle indicator: `colors.mutedSubtle`, 44×4pt
- Backdrop: 40% opacity, dismisses on press
- Keyboard behavior: `interactive` on iOS, `extend` on Android
- Content padding: 24px all sides, 40px bottom

## Design rules honored

- `surfaceSolid` background — no tinted or dark sheets
- Ambient shadow from `@gorhom/bottom-sheet` layer handles depth (no extra shadow needed)
- No border at the top edge — rounded corners handle the visual separation

## Related

- [../../slate-for-dashboard/object-drawer.md](../../slate-for-dashboard/object-drawer.md)
- [../buttons/](../buttons/README.md)
