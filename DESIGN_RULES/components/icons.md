# Icons

> Lucide icons imported directly from `lucide-react-native` for consistent mobile iconography.

**Status:** Shipped
**Source:** `lucide-react-native`

## Usage

Import icons directly from `lucide-react-native`:

```tsx
import { Plus, Receipt, ArrowLeft, Users } from 'lucide-react-native';
```

This matches the current app code in both screens and Slate components.

## Standard specs

| Context | Size | Stroke / Weight |
|---------|------|----------------|
| Button `leftIcon` / `rightIcon` | 18px | default |
| Tab bar icons | 22-24px | default |
| ExpenseCard icon tile | 20-24px | default |
| Header back arrow | 18-20px | default |
| Empty state / hero icon | 24-28px | default |

Always match icon color to the text or surface it accompanies.

## Current icon set

The app currently uses this Lucide set across route files and Slate components:

| Icon | Import name | Common usage |
|------|-------------|-------------|
| Alert Circle | `AlertCircle` | Validation and warning states |
| Arrow Down Left | `ArrowDownLeft` | Incoming payment |
| Arrow Left | `ArrowLeft` | Back navigation |
| Arrow Left Right | `ArrowLeftRight` | Transfers |
| Arrow Right | `ArrowRight` | Forward navigation |
| Arrow Up Down | `ArrowUpDown` | Settlements and reorder flows |
| Bar Chart 2 | `BarChart2` | Reports |
| Check | `Check` | Success, confirm |
| Check Circle | `CheckCircle` | Completed settlements |
| Chevron Down / Up | `ChevronDown`, `ChevronUp` | Expand and collapse |
| Clock | `Clock` | Activity timing |
| Credit Card | `CreditCard` | Payment methods |
| Equal | `Equal` | Equal split mode |
| Home | `Home` | Home tab |
| Lock | `Lock` | Authentication |
| Mail | `Mail` | Email input |
| Percent | `Percent` | Percentage split mode |
| Pie Chart | `PieChart` | Reports |
| Plus | `Plus` | Add actions |
| Receipt | `Receipt` | Expenses and receipts |
| Send | `Send` | UPI send money |
| Trending Up | `TrendingUp` | Dashboard and reports |
| Trash | `Trash` | Delete |
| User | `User` | Individual profile |
| Users | `Users` | Groups and participant splits |
| X | `X` | Close and dismiss |
| Zap | `Zap` | Smart split / AI hint |

## Adding a new icon

1. Add it from `lucide-react-native`.
2. Keep sizing aligned with the specs above.
3. Prefer reusing an existing icon before expanding the set.

## Further reading

- [buttons/](buttons/README.md) - icon usage in buttons
- [../../user-interface/guides/accessibility.md](../../user-interface/guides/accessibility.md) - icon-only button labels
