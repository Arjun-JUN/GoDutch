# Date Selection

> **Status: Not implemented yet.**

Date picker pattern for expense dates, date range filters, and trip durations.

## Why it's here

GoDutch expenses require a date. Currently the date field accepts free-text input. A proper date picker component is needed to:
- Enforce valid date input
- Support "today" / "yesterday" quick selects
- Allow date range selection for filtering

## Current workaround

Until a dedicated component exists, use a simple text input with a calendar icon and validate the format:

```tsx
<Field label="Date">
  <AppInput
    leftIcon={<CalendarBlank size={18} color={colors.mutedSubtle} />}
    placeholder="Today"
    value={dateString}
    onChangeText={setDateString}
  />
</Field>
```

## Target API (not yet built)

### Single date picker

```tsx
import { DatePicker } from '@/slate'; // not yet exported

<DatePicker
  label="Expense date"
  value={date}
  onChange={setDate}
  maxDate={new Date()}  // can't pick future dates for expenses
/>
```

Tapping it opens an `AppBottomSheet` with a calendar grid.

### Date range picker

```tsx
<DateRangePicker
  label="Date range"
  startDate={start}
  endDate={end}
  onChange={({ start, end }) => { setStart(start); setEnd(end); }}
/>
```

## Design rules (when built)

- Calendar opens in an `AppBottomSheet` at `60%` snap point
- Selected date uses `colors.primary` background, `colors.primaryForeground` text
- Today indicator: `colors.primaryContainer` bg, no border
- No navigation arrows that look like system controls — use Phosphor `CaretLeft` / `CaretRight`
- Month/year header: `Text variant="title"`
- Day cells: 44pt minimum height (touch target)

## Quick select chips

Above the calendar, show contextual chips:
```
[ Today ]  [ Yesterday ]  [ This week ]  [ Last month ]
```

Implemented as `MemberBadge` with `active` state.

## Further reading

- [inputs/](inputs/README.md)
- [bottom-sheet/](bottom-sheet/README.md)
- [../../slate-for-dashboard/filtering-data.md](../../slate-for-dashboard/filtering-data.md)
