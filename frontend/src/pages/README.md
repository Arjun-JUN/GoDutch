# frontend/src/pages

> Full-screen page components: one file per route, each composing Slate components and calling the API.

## Overview

Every entry in `MainRoutes.js` points to a component here. Pages are "smart" — they own data fetching, local state, and business logic for their screen. They delegate all visual rendering to `../slate/` components. Pages do not share state with each other; they each call `lib/api.js` directly.

## How it works

1. React Router renders the matching page component.
2. The component fetches data in `useEffect` on mount (e.g. `api.get('/groups')`).
3. User actions (form submit, button click) call mutation endpoints (POST/PUT/DELETE).
4. Toast notifications (via Sonner) confirm success or surface errors.
5. Navigation is done with `useNavigate()`.

## Key files

| File | Route | What it does |
|------|-------|-------------|
| `Dashboard.js` | `/dashboard` | Mobile-first home — net balance hero, 4 recent activity rows, settlements banner, bottom nav (Home/Groups/Settle/Reports/Profile) and a top-bar account menu with Logout |
| `GroupsPage.js` | `/groups` | Group list, create-group modal |
| `GroupDetail.js` | `/groups/:id` | Members, expenses, and balance within a group |
| `NewExpenseRedesign.js` | `/expenses/new` | Multi-step expense creation: OCR → items → split → confirm |
| `ItemSplitView.js` | `/expenses/split` | Per-item member assignment with live totals |
| `ExpenseDetail.js` | `/expenses/:id` | View and edit a single expense |
| `SettlementsPageRedesign.js` | `/settle` | You-owe / you're-owed with UPI pay buttons |
| `ReportsPage.js` | `/reports` | Category breakdown, trends, per-member spending |
| `AuthPageRedesign.js` | `/auth` | Login / register |
| `UPIHome.js` | `/upi` | Linked accounts and transaction history |
| `SendMoney.js` | `/upi/send` | Send money to a UPI ID |
| `AddBankAccount.js` | `/upi/accounts/add` | Link a new bank account |
| `SlateDocs.js` | `/slate-docs` | Internal design system documentation viewer |

## Inputs & Outputs

**Takes in:** URL params (`useParams`), auth state (`useContext(AuthContext)`), API responses.
**Emits:** Rendered DOM; API mutations; `useNavigate()` calls; toast notifications.

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `MainRoutes.js` | React Router renders these as route elements |
| Downstream | `../slate/` | All visual components |
| Downstream | `../lib/api.js` | All data fetching and mutations |
| Downstream | `../contexts/AuthContext.js` | Current user identity and token |
| Downstream | `../utils/` | Splitting calculations |

## Gotchas

- `NewExpenseRedesign.js` and `ItemSplitView.js` share state via React Router location state (not a context). If you navigate away mid-flow, the split state is lost.
- Receipt images are converted to base64 in the browser before being sent to the OCR endpoint. Large images can slow the request significantly.

## Further reading

- [slate/](../slate/README.md)
- [lib/](../lib/README.md)
