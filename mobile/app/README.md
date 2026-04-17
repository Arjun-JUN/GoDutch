# mobile/app

> Expo Router file-based navigation: every file is a route, every folder is a route group.

## Overview

Expo Router maps the file system to navigation. `_layout.tsx` files define layout wrappers (stack, tabs). Route files render screen content. Groups like `(tabs)/` and `(upi)/` organize related screens without affecting the URL path.

The root `_layout.tsx` sets up the global `<AuthProvider>` and the root `<Stack>`. `index.tsx` is the entry point — it reads auth state and redirects accordingly.

## How it works

1. App launches → root `_layout.tsx` runs → wraps in `AuthProvider` + `Stack`.
2. `index.tsx` checks `AuthContext.token`. If absent → navigate to `auth`. If present → navigate to `(tabs)`.
3. `(tabs)/_layout.tsx` renders the bottom tab bar with four tabs.
4. Each tab screen imports state from Zustand stores and components from `../src/`.

## Key files

| File | Route | What it does |
|------|-------|-------------|
| `_layout.tsx` | (root) | Global providers, root Stack navigator |
| `index.tsx` | `/` | Auth redirect logic |
| `auth.tsx` | `/auth` | Login / register screen |
| `(tabs)/_layout.tsx` | — | Bottom tab bar definition |
| `(tabs)/dashboard.tsx` | `/` (tab) | Balance summary, recent expenses |
| `(tabs)/expenses.tsx` | `/expenses` | Full expense list grouped by month |
| `(tabs)/settlements.tsx` | `/settlements` | Owe/owed breakdown + Pay/Nudge actions |
| `(tabs)/profile.tsx` | `/profile` | User info, UPI accounts, sign out |
| `(upi)/index.tsx` | `/upi` | UPI home — accounts, history |
| `(upi)/send.tsx` | `/upi/send` | Send money flow |
| `(upi)/accounts/add.tsx` | `/upi/accounts/add` | Add bank account |
| `expenses/[id].tsx` | `/expenses/:id` | Expense detail / edit |
| `groups/` | `/groups`, `/groups/:id` | Group list and group detail |
| `reports/` | `/reports/:id` | Group reports |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | Expo Runtime | File system → route tree |
| Downstream | `../src/stores/` | Zustand state reads/writes |
| Downstream | `../src/slate/` | All visual components |
| Downstream | `../src/api/client.ts` | Direct API calls for one-off fetches |
| Downstream | `../src/contexts/AuthContext.tsx` | User identity |

## Gotchas

- Route groups (parentheses folders) do not appear in the URL. `(tabs)/dashboard.tsx` maps to `/`, not `/tabs/dashboard`.
- `_layout.tsx` at each level wraps all child screens. Navigation within a group should use relative paths.

## Further reading

- [(tabs)/](<(tabs)/README.md>) — main tab screens
- [(upi)/](<(upi)/README.md>) — UPI payment screens
- [../src/](../src/README.md)
