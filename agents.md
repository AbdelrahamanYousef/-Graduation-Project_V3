# AGENTS.md - Project System Guidelines & Rules

## 🎯 AI Scope & Behavior (CRITICAL)
- **Strict Scoping:** Limit your changes strictly to the requested page, component, or task. Do NOT refactor or modify unrelated files.
- **Do No Harm:** Before modifying any file, analyze its current functionality. If your change breaks existing features, REVERT your changes immediately. Do not commit broken code.
- **Focus:** Do not attempt to fix "everything." Fix only what is requested in the prompt.

## 🚫 Strict AI Behavior & Anti-Hallucination Rules
- **NO ASSUMPTIONS:** Do NOT assume missing requirements, features, or context. Do not invent variables, files, or endpoints that were not explicitly mentioned. If you are unsure, STOP and ask. If you make a mistake, REVERT your changes immediately; do not try to fix a hallucinated mistake with more broken code.
- **NO OVER-ENGINEERING (Keep It Simple):** Solve ONLY the current problem. If a bug can be fixed in 2 lines, write ONLY 2 lines. Do NOT write 1000 lines to solve "potential future problems". Focus exclusively on fixing the issue for today.
- **LASER FOCUS (Zero Scope Creep):** If instructed to fix a specific issue on a specific page, fix exactly that issue. Do NOT touch, refactor, reformat, or "improve" any unrelated code, components, or files in a massive 1000-line overhaul.
- **NEVER DELETE UNKNOWN CODE:** Do NOT delete, comment out, or alter code just because you do not understand its purpose. Assume all existing code is critical and functioning perfectly unless explicitly instructed to remove it.

## 🗂️ Routing & Navigation Rules
- **No Hardcoded Strings:** When using `<Route>`, `<Link>`, or `useNavigate()`, NEVER use hardcoded string paths (e.g., `to="/login"`).
- **Mandatory Imports:** You MUST import the global `paths` object from `src/constants/paths.js` and use it for all routing (e.g., `to={paths.auth.login}`).
- **Adding New Routes:** If a task requires a completely new page, you MUST first add its route definition to the `paths.ts` file before using it in the application. Keep paths clean, minimal, and centralized.

## 🎨 UI/UX & Styling
- **Dark Mode Mandatory:** Every new component, page, or UI modification MUST support Dark Mode out-of-the-box. Ensure CSS/Tailwind classes handle both light and dark themes seamlessly.
- **Responsive Design:** Ensure all modifications look correct on mobile, tablet, and desktop views.

## 📐 UI/UX Scaling & Contrast Rules
- **Proper Scaling:** Avoid oversized elements. Use standard container widths (e.g., `max-w-7xl mx-auto`). Keep padding (`p-4` to `p-6`) and typography sizes reasonable so users do not have to scroll excessively to view primary content on desktop screens.
- **Visual Contrast:** NEVER place white cards on a pure white background. Use subtle off-white backgrounds (e.g., `bg-gray-50`) for the page body to ensure white components (`bg-white`) stand out. Apply subtle borders (`border-gray-100`) and soft shadows (`shadow-sm`) to delineate sections.
- **Color Pop:** Ensure buttons, badges, and status indicators have distinct, accessible colors that guide the user's eye naturally without causing visual fatigue.

## 🎨 Banner Color Themes
To maintain 100% UI consistency across the platform, banners must strictly follow one of the 3 semantic color themes via the `<HeroBanner themeVariant="..." />` component:
- `programs` (Default): Emerald/Forest Green (representing Growth and core charity). Used for Programs, Home, and About pages.
- `campaigns`: Blue/Teal (representing Trust, relief, and seasonal support). Used for Campaigns and Volunteer pages.
- `zakat`: Amber/Warm Orange (representing Urgency, warmth, and wealth). Used for Zakat Calculator and Urgent Cases sections.

## 🔄 Data, Database & State Management
- **Database Consistency:** Any modification, addition, or deletion on the frontend MUST correctly communicate with the backend and successfully reflect in the Database.
- **Cache Awareness:** Be mindful of cached data. If updates are not appearing, ensure the cache is cleared or invalidated after mutations so the user sees the latest updates immediately.
- **Admin vs. User Sync:** If a new feature, data field, or modification is added for the "User" side, ensure it is also properly integrated, visible, and manageable in the "Admin" dashboard and properly stored in the database.

## 💻 Dev Environment Tips
- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.

## 🧪 Testing Instructions
- Find the CI plan in the `.github/workflows` folder.
- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- From the package root you can just call `pnpm test`. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: `pnpm vitest run -t "<test name>"`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## 🌿 PR & Git Instructions
- **Branching:** Never work on the `main` or `master` branch. Always create a new isolated branch for your specific task (e.g., `fix/user-profile-dark-mode`).
- **Pull Requests (PR):** Do not merge directly. Always create a Pull Request for manual review.
- **PR Title Format:** `[<project_name>] <Title>`
- Always run `pnpm lint` and `pnpm test` before committing.