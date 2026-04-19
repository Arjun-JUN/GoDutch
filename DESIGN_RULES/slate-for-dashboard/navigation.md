# Navigation

> `Header` component plus Expo Router tab navigation.

## In-page header

GoDutch disables native stack headers globally. All screens render their own `Header` component from Slate:

```tsx
import { Header } from '@/slate';

<Header title="Group Detail" showBack />
<Header title="GoDutch" showBack={false} right={<BellButton />} />
<Header eyebrow="GOA TRIP" title="Expenses" showBack />
```

## Header props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `title` | string | - | Centered title text |
| `eyebrow` | string | - | Small caps label above title |
| `showBack` | boolean | `true` | Renders an `AppButton variant="icon"` with `ArrowLeft` |
| `onBack` | `() => void` | - | Custom back handler; defaults to `router.back()` |
| `right` | ReactNode | - | Slot for right-side action |

## Tab navigation

Tabs are defined in `mobile/app/(tabs)/`. Tab bar icons currently use `lucide-react-native` at about `size={24}`.

For navigation between screens within a tab, use `router.push()` from `expo-router`. Back is handled by `Header.showBack`.

## No drawer navigation

GoDutch does not use a slide-out drawer menu. All navigation is via tabs plus stack push and pop.

## Further reading

- [../components/header/](../components/header/README.md)
- [object-drawer.md](object-drawer.md) - drawer here means a bottom sheet, not a nav drawer
