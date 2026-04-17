# Effective Data Visualization

> **Status: Not implemented yet.**

Design rules for charts that fit the Alpine Ledger visual language.

## Color palette for charts

Use the Slate token palette — not arbitrary colors:

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Primary series | `colors.primary` | `#4e635a` | Main data series, "you" in group charts |
| Secondary series | `colors.primaryContainer` | `#d1e8dd` | Background series, comparison |
| Danger / negative | `colors.danger` | `#9f403d` | "You owe" segments |
| Muted series | `colors.muted` | `#576160` | Others in a group |
| Grid lines | `colors.soft` | `#f0f4f3` | Axis tick lines (light, not distracting) |

For multi-series charts needing more colors, extend from the token palette's tonal family — do not introduce brand-new colors.

## Chart design rules

1. **No border around the chart** — the chart lives on a `surfaceSolid` `AppSurface`, which provides container context.
2. **No grid lines unless essential** — one set of horizontal grid lines at most, in `colors.soft`.
3. **No legend unless necessary** — label series directly on the chart or below it.
4. **Rounded bar ends** (`borderRadius: 4`) — matches the system's "no sharp edges" rule.
5. **Generous padding** inside the chart — min 16px from axes to chart edge.
6. **Axis labels**: `Text variant="label" tone="subtle"` (13px, muted color).
7. **Data labels**: `Text variant="label" weight="semibold"` directly on bar tops or donut center.

## Accessibility

- Never use color alone to distinguish series — add a legend label or direct annotation.
- Ensure chart container has `accessibilityRole="image"` and a descriptive `accessibilityLabel`.
- Consider an accessible table fallback below complex charts.

## Recommended library

When implementing: **`victory-native`** (works with React Native + Reanimated). Avoid `react-native-chart-kit` — it lacks customization needed to match Alpine Ledger's aesthetic.

## Further reading

- [choosing-the-right-chart.md](choosing-the-right-chart.md)
- [../../user-interface/guides/color.md](../../user-interface/guides/color.md)
- [../../user-interface/guides/accessibility.md](../../user-interface/guides/accessibility.md)
