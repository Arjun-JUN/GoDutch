# Legacy Web (frontend/src/slate)

> **Status: frozen.** The web frontend is not receiving new Slate features. Use `mobile/src/slate/` for all new work.

## What exists

`frontend/src/slate/` contains a web-only (React 18 + Tailwind CSS + Framer Motion) implementation of Slate with the same component names (`AppButton`, `AppSurface`, `AppShell`, etc.) but different internals:

- Styling: Tailwind CSS utility classes, no NativeWind
- Animation: Framer Motion (not Reanimated)
- No `Text` component — uses raw `<p>` / `<h*>` elements
- No `AppBottomSheet` — uses `dialog`/`sheet` primitives from `frontend/src/slate/ui/`

## Why it's frozen

GoDutch is consolidating on React Native as the single delivery platform (iOS, Android, and eventually web via RN for Web). Maintaining two parallel component trees creates drift and doubles documentation burden.

## What to do instead

For any new UI work, build in `mobile/src/slate/`. See [setup.md](setup.md) for the RN for Web migration path.

If you need to reference the web component API for parity, the source is at:
- `frontend/src/slate/components/` — branded components
- `frontend/src/slate/ui/` — shadcn/ui primitives

Do **not** add new components or update existing docs for the web layer.
