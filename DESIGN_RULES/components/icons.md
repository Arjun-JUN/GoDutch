# Icons

> Phosphor icons re-exported from `@/slate/icons` for consistent weight and size.

**Status:** Shipped · **Source:** `frontend/src/slate/icons/index.js` (web) / direct `phosphor-react-native` in mobile  
**Mobile import:** `phosphor-react-native` directly in `mobile/src/slate/` components; screens use `@/slate/icons`

## Usage

Import icons from the centralized barrel — never from `@phosphor-icons/react` or `phosphor-react-native` directly in screens:

```tsx
import { Plus, Receipt, ArrowLeft, Users } from '@/slate/icons';
```

This decouples screens from the specific icon library. If the library changes, only the barrel needs updating.

## Standard specs

| Context | Size | Stroke / Weight |
|---------|------|----------------|
| Button `leftIcon` / `rightIcon` | 18px | strokeWidth 2 |
| Tab bar icons | 24px | default |
| ExpenseCard icon tile | 24px | strokeWidth 2 |
| Header back arrow | 18px | strokeWidth 2.4 |
| EmptyState | 28px | default |

Always match icon color to the text it accompanies:

```tsx
// Icon on primary button
<Plus size={18} color={colors.primaryForeground} />

// Icon in ghost button
<PencilSimple size={18} color={colors.foreground} />

// Icon in danger context
<Trash size={18} color={colors.danger} />

// Muted icon (search, placeholder)
<MagnifyingGlass size={18} color={colors.mutedSubtle} />
```

## Available icons

The following Phosphor icons are in the web barrel (`frontend/src/slate/icons/index.js`). Mobile uses `phosphor-react-native` for the same set:

| Icon | Import name | Common usage |
|------|-------------|-------------|
| Airplane | `Airplane` | Travel category |
| Arrow Left | `ArrowLeft` | Back navigation |
| Arrows Down Up | `ArrowsDownUp` | Sort |
| Arrows Left Right | `ArrowsLeftRight` | Transfer |
| Bell | `Bell` | Notifications |
| Calendar Blank | `CalendarBlank` | Date picker |
| Camera | `Camera` | Receipt scan |
| Car | `Car` | Transport category |
| Caret Down/Right/Up | `CaretDown`, `CaretRight`, `CaretUp` | Expand/collapse, chevron |
| Chart Bar | `ChartBar` | Analytics |
| Chart Line Up | `ChartLineUp` | Trends |
| Check | `Check` | Success, confirm |
| Coffee | `Coffee` | Café category |
| Currency INR | `CurrencyInr` | Amount display |
| Envelope Simple | `EnvelopeSimple` | Email |
| Film Strip | `FilmStrip` | Entertainment |
| Fingerprint | `Fingerprint` | Biometric auth |
| Fork Knife | `ForkKnife` | Food category |
| Hash | `Hash` | Reference numbers |
| House | `House` | Home tab |
| Image Square | `ImageSquare` | Photo |
| Info | `Info` | Help, tooltip |
| Lightbulb | `Lightbulb` | Tips |
| Lightning | `Lightning` | Quick action |
| List | `List` | Menu |
| Lock | `Lock` | Security |
| Microphone | `Microphone` | Voice |
| Money | `Money` | Finance |
| Note | `Note` | Notes |
| Paper Plane Tilt / Right | `PaperPlaneTilt`, `PaperPlaneRight` | Send / share |
| Pencil Simple | `PencilSimple` | Edit |
| Phone | `Phone` | Contact |
| Plus | `Plus` | Add action |
| QR Code | `QrCode` | QR payment |
| Receipt | `Receipt` | Expense, receipt |
| Shopping Bag | `ShoppingBag` | Shopping category |
| Shopping Cart | `ShoppingCart` | Cart |
| Sign Out | `SignOut` | Logout |
| Sparkle | `Sparkle` | AI features |
| Stethoscope | `Stethoscope` | Medical category |
| Tag | `Tag` | Category |
| Ticket | `Ticket` | Events |
| Trash | `Trash` | Delete |
| Trend Up | `TrendUp` | Positive trend |
| User | `User` | Single person |
| Users | `Users` | Group (2 people) |
| Users Three | `UsersThree` | Group (3+ people) |
| Cards | `Cards` | Payment cards |
| Wallet | `Wallet` | Wallet / payments |
| X | `X` | Close / dismiss |

## Adding a new icon

1. Install it from `phosphor-react-native` (already a dependency).
2. Add the export to `frontend/src/slate/icons/index.js` for web parity.
3. Import it in mobile screens directly from `phosphor-react-native` (standard practice in mobile components).

## Further reading

- [buttons/](buttons/README.md) — icon usage in buttons
- [../../user-interface/guides/accessibility.md](../../user-interface/guides/accessibility.md) — icon-only button labels
