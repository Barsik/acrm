# CLAUDE.md - client-portal-front

Client portal front-end. Operators search for clients and view aggregated data from multiple sources.

## Tech Stack
- `React 19 + TypeScript (strict mode)` - Framework
- `Vite` - Build
- `React Router v7` - Routing
- `TanStack Query v5` - Data fetching
- `Zustand` - Client state management
- `shadcn/ui` - UI Components
- `Tailwind CSS v4` - Styling
- `npm` - Package manager

## Commands
```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
npm run preview  # preview production build
```

## Project Structure
```
src/
  components/    # shared UI components (shadcn wrappers, common widgets)
  features/      # feature slices — each folder owns its routes, components, hooks
  hooks/         # shared custom hooks
  lib/           # api client, query client setup, utils
  pages/         # route-level components (thin, delegate to features)
  types/         # shared TypeScript types
  main.tsx
  router.tsx
```

## Design

Visual design from a Claude Design handoff. Full style guide: [`.claude/references/moex-design-system.md`](/client-portal-front/.claude/references/moex-design-system.md)

Key points:
- Brand font: **PT Sans** (Google Fonts, 400/700 only)
- Accent: `#E8001C` (MOEX red) — `--primary` + Tailwind `bg-moex-red` / `text-moex-red`
- Page bg: `#F6F7FA`, cards: `#FFFFFF`, borders: `#E8EBF0`
- MOEX tokens defined in `src/index.css` (`:root` + `@theme inline`)
- Three pages: `/login`, `/` (Google-style search), `/clients/:id` (detail)
- Auth guard: `ProtectedRoute` checks `localStorage.moex_auth`

## Conventions

### Components
- One component per file, named export, filename matches component name
- Use shadcn/ui primitives; extend via `className` with `cn()` helper — never override with inline styles
- Co-locate feature-specific components inside `features/<name>/`

### shadcn/ui
- Add components: `npx shadcn@latest add <component>`
- Components land in `src/components/ui/` — do not edit generated files directly; wrap them instead
- Theme tokens live in `src/index.css` (CSS variables); adjust there, not in component files

### Data Fetching
- All server state via TanStack Query — no `useEffect` + `fetch` patterns
- Query keys as constants in `lib/queryKeys.ts`
- One `use<Resource>Query` hook per resource; mutations in `use<Resource>Mutation` hooks
- API base URL from `VITE_API_URL` env var; typed axios/fetch client in `lib/api.ts`

### Routing
- Routes defined in `router.tsx` using `createBrowserRouter`
- Lazy-load page components with `React.lazy`
- Route params typed via `useParams` + explicit type assertion

### Styling
- Tailwind utility classes only — no custom CSS files except global resets in `index.css`
- Responsive: mobile-first (`sm:`, `md:`, `lg:` prefixes)
- Dark mode via `dark:` variant if needed

### TypeScript
- `strict: true` — no `any`, no `@ts-ignore`
- API response shapes in `types/api.ts`; derive UI types from them with `Pick`/`Omit`

## Environment Variables
```
VITE_API_URL=http://localhost:3000   # BFF base URL
```
