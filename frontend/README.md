# GoDutch Frontend

The premium React application forGoDutch, built with a focus on speed, aesthetics, and modularity.

## Tech Stack
- **Framework**: React 18+
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Design System**: Slate (Custom library in `src/slate`)
- **Icons**: Phosphor Icons (via `@/slate/icons`)
- **Animations**: Framer Motion
- **Styling**: Vanilla CSS with modern tokens

## Getting Started

### 1. Install Dependencies
We strictly recommend using **pnpm** for this repository to ensure consistent dependency resolution.
```powershell
pnpm install
```

### 2. Start Development Server
```powershell
pnpm dev
```
The app will be available at `http://localhost:3000`.

### 3. Environment Setup
Create a `.env` file in the `frontend` root:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Project Structure
- `src/slate/`: Core design system components, icons, and tokens.
- `src/pages/`: Main application views (Dashboard, Auth, Expenses, etc.).
- `src/contexts/`: Global state management (Auth, etc.).
- `src/lib/`: API utilities and helper functions.

## Design Guidelines
When building new features, always:
1. **Use Slate Components**: Prioritize components from `@/slate` (e.g., `AppButton`, `AppSurface`).
2. **Follow Tokens**: Use CSS variables from `tokens.css` (e.g., `var(--app-primary)`).
3. **Icons**: Import all icons from `@/slate/icons` to maintain style consistency.
4. **Animations**: Use the built-in `motion` variants for smooth page transitions.

## Testing
Run the test suite using Vitest:
```powershell
pnpm test
```
