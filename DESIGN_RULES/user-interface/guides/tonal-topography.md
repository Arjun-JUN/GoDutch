# Tonal Topography

> Create visual separation through background color shifts and negative space — never through 1px solid borders.

## The No-Line Rule

**1px solid borders are prohibited for defining sections.** This is the single most important rule in the design system. Hard lines make the UI feel like a spreadsheet. Instead:

- Separate regions by placing a different background color behind them.
- Use generous padding to create group boundaries through negative space.
- When accessibility truly requires a boundary, use `colors.borderGhost` (`rgba(169,180,179,0.15)`) — a near-invisible ghost border.

## Surface Hierarchy

Three tonal levels create a natural depth stack:

| Level | Token | Hex | Used for |
|-------|-------|-----|---------|
| Base (screen) | `colors.backgroundStart` → `colors.backgroundEnd` | `#f8faf9` → `#eef3f1` | Screen background gradient (`AppShell`) |
| Secondary content | `colors.soft` | `#f0f4f3` | Input fields, secondary surface sections |
| Elevated cards | `colors.surfaceSolid` | `#ffffff` | Cards (`AppSurface solid`), list rows |

The 3% luminance difference between levels is enough. You do not need shadows to separate them — though `shadows.cardSm` is used on elevated white cards to reinforce lift.

## In practice

```tsx
// ✅ Correct — use a different bg on the card, no border
<AppShell>            {/* bg: #f8faf9 → #eef3f1 gradient */}
  <AppSurface variant="solid">  {/* bg: #ffffff, soft shadow */}
    <Text>Content</Text>
  </AppSurface>
</AppShell>

// ❌ Wrong — do not do this
<View style={{ borderWidth: 1, borderColor: '#ddd' }}>
  <Text>Content</Text>
</View>
```

## Glass variant

For overlays and hero cards that float over imagery, `AppSurface variant="glass"` uses `BlurView` at 85% opacity — producing the translucent depth effect without borders.

## Further reading

- [color.md](color.md)
- [elevation-and-luminosity.md](elevation-and-luminosity.md)
- [../../components/surfaces/](../../components/surfaces/README.md)
