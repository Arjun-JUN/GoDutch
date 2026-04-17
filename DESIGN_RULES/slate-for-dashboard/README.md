# Slate for Dashboard

> Patterns for building screens that display, filter, and navigate data — the dashboard layer of GoDutch.

## Overview

Dashboard screens are the high-density, data-rich surfaces in GoDutch: the main dashboard, group detail, expense lists, and settings. This section documents the composition patterns for those screens using Slate components.

Most patterns here are **compositions** of existing Slate components (AppShell, PageHero, Header, ExpenseCard, AppSurface, AppBottomSheet). Some, like Tables and Filtering, are **not yet implemented** and need new components.

## Contents

| File | Status | What it covers |
|------|--------|---------------|
| [page-templates.md](page-templates.md) | Shipped | `AppShell` + `PageHero` + `PageContent` recipes |
| [overview-page.md](overview-page.md) | Shipped | Dashboard home screen pattern |
| [list-page.md](list-page.md) | Shipped | `FlatList` + `ExpenseCard` pattern |
| [detail-page.md](detail-page.md) | Shipped | Expense detail / object detail pattern |
| [navigation.md](navigation.md) | Shipped | `Header` + Expo Router tab navigation |
| [object-drawer.md](object-drawer.md) | Shipped | `AppBottomSheet` as a contextual action panel |
| [label-standards.md](label-standards.md) | Shipped | Text variant + tone usage in data contexts |
| [settings.md](settings.md) | Placeholder | Settings screen pattern |
| [tables.md](tables.md) | Placeholder | Tabular data display |
| [filtering-data.md](filtering-data.md) | Placeholder | Filter chips and sort controls |

## Further reading

- [../components/](../components/README.md)
- [../user-interface/guides/spacing-and-rhythm.md](../user-interface/guides/spacing-and-rhythm.md)
