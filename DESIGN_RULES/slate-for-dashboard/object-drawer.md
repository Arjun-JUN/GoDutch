# Object Drawer

> `AppBottomSheet` as a contextual action panel for an object (expense, member, settlement).

## What it is

An "object drawer" is a bottom sheet that surfaces contextual actions for a specific item — edit, delete, share, settle. It is the mobile-native action surface for expense, member, and settlement actions.

## Pattern

```tsx
import { useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppBottomSheet, SheetHeader, AppButton } from '@/slate';
import { Pencil, Trash } from 'lucide-react-native';
import { colors } from '@/theme/tokens';

export function ExpenseDrawer({ expense, onEdit, onDelete }) {
  const sheetRef = useRef<BottomSheetModal>(null);

  return (
    <AppBottomSheet
      ref={sheetRef}
      snapPoints={['35%']}
      scrollable={false}
    >
      <SheetHeader title={expense.merchant} onClose={() => sheetRef.current?.dismiss()} />

      <AppButton
        variant="ghost"
        size="md"
        leftIcon={<Pencil size={18} color={colors.foreground} />}
        onPress={onEdit}
        style={{ justifyContent: 'flex-start' }}
      >
        Edit expense
      </AppButton>

      <AppButton
        variant="ghost"
        size="md"
        leftIcon={<Trash size={18} color={colors.danger} />}
        onPress={onDelete}
        style={{ justifyContent: 'flex-start' }}
      >
        <Text tone="danger">Delete expense</Text>
      </AppButton>
    </AppBottomSheet>
  );
}
```

## Opening the drawer

Use `BottomSheetModal` ref pattern:

```tsx
const drawerRef = useRef<BottomSheetModal>(null);

// Open
drawerRef.current?.present();

// Close
drawerRef.current?.dismiss();
```

## Design rules

- Always include a `SheetHeader` with a title and close button — users must be able to dismiss without swiping.
- Destructive actions (delete, remove member) go **last** in the list and use `tone="danger"` text.
- Use `variant="ghost"` buttons with `leftIcon` in action lists — not icon-only buttons (labels aid discoverability).
- Max 5 actions in a drawer. If you need more, rethink the information architecture.

## Further reading

- [../components/bottom-sheet/](../components/bottom-sheet/README.md)
- [../components/buttons/](../components/buttons/README.md)

