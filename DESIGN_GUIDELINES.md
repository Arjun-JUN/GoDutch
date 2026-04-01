# GoDutch Design Guidelines

**Core Philosophy: "The Mindful Ledger"**
In an industry often defined by aggressive alerts and high-contrast friction, this system moves in the opposite direction. It treats expense splitting not as a chore, but as a calm, transparent dialogue between friends. We break the "template" look by eschewing rigid boxes in favor of **Tonal Topography**.

---

## 1. UI/UX Core Concepts (Always Follow)

### Affordances and Signifiers
* **Grouping:** Use unified containers to signal related elements visually.
* **Active vs. Inactive:** Highlight active states distinctly (e.g., placing an active container) so users intuitively understand selection.
* **Disabled State:** Clearly communicate inactive elements by muting them (e.g., graying out text), indicating clicks will have no effect.

### Visual Hierarchy
* **Focal Points:** Use imagery intuitively (e.g., item images at the top) to make cards/components easy to scan.
* **Size and Weight:** The most important information (like the item name) must be large and bold at the top. Secondary details should have a noticeably smaller font and subdued weight.
* **Color as a Signal:** High contrast colors should be reserved to draw the eye immediately to primary actionable or important information (like price).
* **Iconography over Text:** Replace verbose pathing or actions with simple icons and lines to visually signify concepts (e.g., using a route line with icons instead of "from" and "to").

### Interaction and Feedback
Every action MUST have a clear response.
* **Button States:** Ensure that buttons transition through all explicit states: **Default**, **Hovered**, **Pressed**, **Disabled**, and **Loading** (with a clear visual spinner/indicator).
* **Micro-interactions:** Actions like copying or saving should trigger explicit ephemeral feedback, distinct from standard click flashes (e.g., a "Copied!" sliding chip or toast).

### Technical Execution (Grids and Overlays)
* **Spacing (4-Point Grid):** Strictly adhere to a 4-point/8-point grid system (e.g., 32px gaps) to ensure rhythm and create a balanced, professional look.
* **Readability Overlays:** When placing text over imagery, readability is paramount. Always use a linear gradient or progressive blur behind the text to maintain contrast against any dynamic background.

---

## 2. Alpine Ledger Design System Rules

### Colors: Tonal Depth & The No-Line Rule
* **The "No-Line" Rule:** 1px solid borders are PROHIBITED for defining sections. Boundries must be defined through:
  * **Background Shifts:** Placing a `surface-container-low` (#f0f4f3) against `surface` (#f8faf9).
  * **Negative Space:** Generous spacing to create groupings.
* **Surface Hierarchy & Nesting:**
  * Base: `surface` (#f8faf9)
  * Secondary Content: `surface-container-low` (#f0f4f3)
  * Elevated Components: `surface-container-lowest` (#ffffff)
* **The "Glass & Gradient" Rule:**
  * Primary action buttons must use a subtle linear gradient from `primary` (#4e635a) to `primary-dim` (#42574e).
  * Overlays/modals must use `surface-container-lowest` at 85% opacity with a `20px` backdrop blur.

### Typography: The Editorial Voice
* Typeface: **Manrope**
* **Display Elements:** Tight letter spacing (-0.02em).
* **Hierarchy:** Use size (`title-sm` vs `body-md`) rather than just weight to differentiate.
* **Body & Labels:** Use `on-surface-variant` (#576160) instead of pure black for a low-contrast, elegant aesthetic.

### Elevation & Depth: Tonal Layering (Ambient Luminosity)
* **The Layering Principle:** Don't use heavy shadows to highlight cards. Use a `surface-container-lowest` (#ffffff) card on a `surface-container` (#e9efee) background. The 3% luminance difference is enough.
* **Ambient Shadows:** Floating elements (like Bottom Sheets) get an ultra-diffused shadow (`0 12px 40px rgba(42, 52, 52, 0.06)`).
* **The "Ghost Border" Fallback:** If accessibility requires a boundary, use `outline-variant` (#a9b4b3) at 15% opacity.

### Component Guidelines
* **Buttons:**
  * Primary: Gradient (`primary` to `primary-dim`), Pill shape (fully rounded).
  * Secondary: `primary-container` (#d1e8dd) background, no border.
  * Tertiary (Text-only): Wide horizontal padding (2rem) for a premium hit-area.
* **Cards & Lists:** 
  * NO divider lines. Use padding and hover states (`surface-container-low`) instead.
  * Asymmetry: Offset amounts from descriptions using generous whitespace rather than right-aligning to the edge.
* **Input Fields:**
  * No bottom lines. Background `surface-container-highest` (#dae5e3) with `xl` (0.75rem) rounded corners. Focus shifts background to `primary-container`.
* **Contextual Components:** Use soft-sage floating elements with backdrop-blur expansions instead of standard rigid FABs.

### Do's and Don'ts
* **DO** use expansive spacing (e.g., 8.5rem top margins) to create an "Art Gallery" feel.
* **DO** prioritize "Title Case" for headings to maintain a professional, editorial tone.
* **DON'T** use pure #000000 or #ffffff for text/containers (except base). High contrast breaks the calm aesthetic.
* **DON'T** use `none` roundedness. Even sharpest elements need `sm` (0.125rem) radius.
* **DON'T** use standard bright red for errors. Use a desaturated, curated `error` tone (#9f403d) to avoid user panic.

### Spacing & Rhythm
* **0.7rem Rhythms:** Spacing follows multiples of 2. Focus on generous breathing room. 
* **The Breath:** Lean toward larger spacing (e.g., 5.5rem between functional groups). When in doubt, more space = more premium.
