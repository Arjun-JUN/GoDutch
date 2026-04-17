# Choosing the Right Chart

> **Status: Not implemented yet.**

Decision guide for selecting the right chart type in GoDutch analytics screens.

## Quick reference

| Question to answer | Chart type |
|-------------------|-----------|
| How much did I spend this month vs. last month? | Bar chart (comparison) |
| How has my balance changed over time? | Line chart (trend) |
| What percentage of my spending is food vs. transport? | Donut chart (composition) |
| Who contributed most to a group expense? | Horizontal bar (ranking) |
| How is a single expense split among people? | Stacked bar or donut |

## Decision tree

1. **Am I comparing values at different points in time?** → Line chart
2. **Am I comparing values between discrete categories?** → Bar chart
3. **Am I showing how a whole is divided into parts?** → Donut chart (max 5 slices)
4. **Am I ranking items?** → Horizontal bar chart (label → value, sorted descending)

## Rules

- **Max 5 categories** in a donut or legend. Group smaller slices into "Other."
- **Start bar charts at zero** — never truncate the y-axis.
- **No 3D charts** — flat, 2D only.
- **No pie charts** — use donut (pie with center cutout) to allow a summary value in the center.

## Further reading

- [effective-data-visualization.md](effective-data-visualization.md)
- [../../user-interface/guides/color.md](../../user-interface/guides/color.md)
