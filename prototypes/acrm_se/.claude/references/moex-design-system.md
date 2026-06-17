# Style Requirements — MOEX Client Portal

Originally derived from the Claude Design handoff (`moex-client-view.html`), now actualized
against the live app: a multi-role portal (Manager / Employee) with persistent navigation,
ranking dashboards, network graphs, heatmap/scoring tiles, and product catalogs.

Most UI is built with inline `style={{...}}` objects using the literal values below (not
Tailwind utility classes), except for shadcn/ui + base-ui primitives (`calendar`,
`popover`, `dropdown-menu`, `pagination`, `toggle`), which use the Tailwind theme tokens
defined in `src/index.css` and need no MOEX-specific overrides.

---

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--moex-red` | `#E8001C` | Primary action, buttons, active states, brand accent |
| `--moex-red-hover` | `#C40018` | Button hover state |
| `--moex-bg` | `#F6F7FA` | Page background, header background |
| `--moex-surface` | `#FFFFFF` | Card backgrounds |
| `--moex-border` | `#E8EBF0` | Card borders, dividers, inputs |
| `--moex-text` | `#1E2535` | Primary text |
| `--moex-text-2` | `#5A6478` | Secondary text, labels |
| `--moex-muted` | `#A0AABB` | Muted/placeholder text, metadata |

## Neutral / Surface Grays

A second tier of neutral grays has emerged for chips, pills, dense-table backgrounds and
hover states — distinct from `--moex-border` / `--moex-bg`:

| Hex | Usage |
|---|---|
| `#F0F2F5` | Neutral chip/pill background, disabled buttons, secondary buttons, toggle base, `--muted` |
| `#EEF1F5` / `#EEF0F4` | Slightly darker neutral chip bg (category tags, "в работе" status, graph background grid) |
| `#FAFBFD` | Table header row bg, input focus bg, alternating ("zebra") table row bg |
| `#EDF0F4` | Alternate tile/cell border (vs. `--moex-border`) |
| `#E2E5EA` | Hover bg for neutral pills/toggles, active SideNav item bg |
| `#E0E3E9` / `#C8CDD6` | SideNav "last client" deck item border (default / hover) |
| `#D0D4DC` | AppHeader avatar border |
| `#C0C8D4` | Secondary-button hover border, muted icon strokes, numbered-list bullets |
| `#3A4255` | Darker secondary text — body copy on detail pages, avatar-fallback initials, active SideNav label |

---

## Status & Severity Colors

A three-tier semantic system (red / amber / blue) is used everywhere for alerts, tasks,
roles and badges. Background is either a low-alpha tint of the border color or a
dedicated light hex; both forms appear in the codebase.

| Tier | Border / Icon | Background | Text |
|---|---|---|---|
| Danger (critical, overdue) | `#E8001C` | `rgba(232,0,28,0.04–0.10)` or `#FDE7EA` / `#FDECEA` | `#E8001C` |
| Warning (in progress) | `#F7B731` / `#F5A623` | `rgba(247,183,49,0.05–0.14)` or `#FEF3E2` / `#FDF6EC` | `#B07800` / `#92400E` / `#7A5200` |
| Info | `#2196F3` / `#4A90D9` | `rgba(33,150,243,0.04–0.10)` or `#EBF4FC` / `#E6F0FE` | `#1565C0` |

Status pills (text badges): `fontSize: 10–11px`, `fontWeight: 700`, `borderRadius: 99px`,
`padding: '2-4px 8-12px'`. Examples: "Просрочено" → danger tier; "в работе" → neutral
(`#F0F2F5` bg / `#5A6478` text).

### Delta / YoY colors

- **Positive: `#12A05C`** — this is the current convention for growth/positive deltas and
  supersedes the older `#4CAF50`, which still appears in a few legacy chart legends
  (`KpiCard`, donut "NPS" gauge). Prefer `#12A05C` for new positive-delta indicators.
- **Negative: `#E8001C`**
- Helper: `yoyColor(pct) => pct >= 0 ? '#12A05C' : '#E8001C'`, formatted as `▲X%` / `▼X%`
  via `fmtYoY()`.

---

## Score & Ranking Colors

### Heatmap / recommendation score tiers

Used on the client heatmap (product scoring tiles) and the "Приоритетные продукты"
mini-list on the client overview page:

| Tier | Score | Background | Text |
|---|---|---|---|
| `hot` | ≥ 85 | `#1D9E75` | `#fff` |
| `warm` | 70–84 | `#5DCAA5` | `#04342C` |
| `mid` | 50/55–69 | `#FDE68A` (or `#E1F5EE`) | `#92400E` (or `#5DCAA5`) |
| `cool` | 40–54 | `#F0F2F5` | `#5A6478` |
| `cold` | < 40 | `#F0F2F5` @ 55% opacity | `#A0AABB` |

This matches the spec captured in `client-portal-front/heatmap.md` (product-recommendation
tile generator notes) — keep the two in sync if either changes.

### Ranking colors (VIP / leaderboard tables)

```js
function rankColor(rank) {
  return rank <= 5 ? '#12A05C' : rank <= 10 ? '#1E2535' : '#A0AABB'
}
```
Top-5 = green (good), top-10 = primary text, beyond = muted.

Rank-delta badges: improved (negative delta) → `#12A05C` text on `rgba(18,160,92,0.10)`;
worsened (positive delta) → `#E8001C` text on `rgba(232,0,28,0.10)`. Rendered as small
pills (`borderRadius: 99`, `fontSize: 12`, `fontWeight: 700`) positioned top-right of the
metric value.

Rating/rank badges elsewhere (`RATING_STYLE`/`RANK_STYLE`, employee portfolio): A/TOP10 =
green, B/TOP20 = blue/amber, C/TOP100 = gray — `fontSize: 9-10px`, `fontWeight: 700-800`,
`borderRadius: 99`.

---

## Avatar & Logo Palettes

Two distinct cycling palettes are used for "initials avatar" components.

**1. Brand 5-color palette** (clients, owners, logos, funnel/market accents):
```js
const LOGO_COLORS = ['#4A90D9', '#12A05C', '#F5A623', '#9B59B6', '#E8001C']
```
Pick a color via `name.charCodeAt(0) % LOGO_COLORS.length`. Background =
`${color}18` (hex + `18` ≈ 9% alpha suffix), text/icon = the solid color,
`fontWeight: 700`. This `${color}18` / `${color}08` alpha-suffix convention is also used
generally for tinting any per-item accent color (e.g. product icon backgrounds via
`linear-gradient(135deg, ${color}22, ${color}08)`).

**2. Pastel 6-color palette** (`avatarPalette()` in `ContactCard.tsx`, shared with
`DecisionMakersGraph`) — deterministic, hashed from name:

| Background | Text |
|---|---|
| `#FEF3C7` | `#92400E` |
| `#DBEAFE` | `#1E40AF` |
| `#D1FAE5` | `#065F46` |
| `#FCE7F3` | `#9D174D` |
| `#EDE9FE` | `#4C1D95` |
| `#FEE2E2` | `#991B1B` |

---

## Chart & Data-Viz Colors

- **Plan line**: `#F7B731`, dashed (`strokeDasharray: '6 3'`)
- **Fact line / bars**: `#2196F3`, solid
- **Cohort retention heatmap**: green gradient `rgba(46,194,126,0.10)` → `#2ec27e`,
  scaled by value/max; cell text `#04110a`; current-cohort cell gets
  `boxShadow: inset 0 0 0 2px #1E6FD9`
- **Sales funnel** (5 stages): `#5b8def, #36c2cf, #7b6ef6, #f0883e, #2ec27e`; each band is
  `linear-gradient(180deg, ${color}, shadeDark(${color}, -18))` with white text +
  `textShadow` for contrast
- **Stacked bar segments** (`SEG_COLORS`, `lib/mockData.ts`):
  `#7B5EA7, #FF6B35, #3AAFA9, #F7B731, #F1C40F, #95A5A6`
- **Donut/pie**: `innerRadius: 52`, `outerRadius: 82`, `paddingAngle: 2`; custom legend
  below with 8×8px swatches, `borderRadius: 2`
- **Recharts tooltip**: `contentStyle={{ borderRadius: 8, border: '1px solid #E8EBF0', fontSize: 12 }}`
- **Network graphs** (React Flow, `ConnectionsGraph` / `DecisionMakersGraph`): canvas bg
  `#F9FAFB`, dot-grid `#EEF0F4`, edges `#CBD5E1` (`smoothstep`, `strokeWidth: 1.5`).
  Connection categories: legal = blue (`#2196F3` / `rgba(33,150,243,0.08)` / `#1565C0`),
  economic = green (`#43A047` / `rgba(76,175,80,0.08)` / `#2E7D32`), other = amber
  (`#F7B731` edge / `#EAA800` border / `rgba(247,183,49,0.10)` bg / `#7A5200` text)

---

## Typography

**Font:** PT Sans (Google Fonts), weights 400/700 (and occasionally 500/600/800 in
practice — see below). No italic.

| Size | Weight | Color | Usage |
|---|---|---|---|
| 32px | 700 | `--moex-text` | Largest metric value (Employee home KPI row) |
| 28px | 700 | `--moex-text` | Manager home metric value |
| 26px | 700 | `--moex-text` | Page heading (Login, Employee Portfolio) |
| 25px | 800 | rank-tier color | VIP table "overall rank" |
| 22px | 700 | `--moex-text` | `KpiCard` value, page/section titles |
| 22px | 800 | `--moex-text` | Summary metric value (heavier variant, Employee Portfolio) |
| 20px | 700/800 | `--moex-text` | Plan/actual metric tile value; client-header name; heatmap score badge (weight 500) |
| 18px | 700 | `--moex-text` / `--moex-text-2` | Detail-page header title; "not found" messages |
| 15px | 700 | `--moex-text` / `#fff` | Login submit button, `ProductTile` name, ClientTile portfolio value |
| 14px | 700 | `--moex-text` / `#4A90D9` | Body emphasis, contact name; blue client-link variant |
| 13px | 400/600/700 | varies | Body text, table cell values, small card titles |
| 12px | 400/600/700 | `--moex-text-2` | Secondary text, section labels (uppercase, `letterSpacing: 0.5–0.8px`) |
| 11px | 400/600/700 | `--moex-muted` / `--moex-text-2` | Metadata, status pills, tags |
| 10px | 600/700 | `--moex-muted` | Micro uppercase labels — table column headers, metric sublabels (`letterSpacing: '0.04–0.07em'`) |
| 9px | 400/700 | varies | Inline SVG / chart annotation text — smallest text in the app |

**Conventions:**
- `fontVariantNumeric: 'tabular-nums'` on all numeric table/metric values, for column
  alignment.
- `fontWeight: 800` is now common for emphasized large metric values (beyond the
  original 400/700 set).
- Uppercase labels use `letterSpacing` of `0.5–0.8px` or `'0.04em'–'0.07em'`.

---

## Spacing & Sizing

### Header & navigation
| Element | Value |
|---|---|
| `AppHeader` height (current header, in `Layout`) | 62px, bg `#F6F7FA`, padding `0 28px` |
| `SideNav` floating pill | `position: fixed`, `top: 8px`, centered (`left: 50%`, `translateX(-50%)`), `z-50` |
| SideNav nav icon buttons | 40×40px, `rounded-xl` |
| SideNav "last client" deck cards | 40×40px, default overlap 20px, hover fan-out 38px |

> Note: `components/PageHeader.tsx` (68px header, single avatar/logout button) is no
> longer imported anywhere — `AppHeader` + `SideNav` is the current navigation shell
> (`components/Layout.tsx`).

### Page container padding (varies by page density)
| Page type | Padding |
|---|---|
| Search | `80px 32px 36px` (extra top clears the floating SideNav pill) |
| Manager home | `24px 32px` |
| Employee home / Alert detail | `48px 48px 40px` |
| Manager portfolio | `32px 48px` |
| Employee portfolio | `40px 48px` |
| Client detail tabs (overview/heatmap/additional-info) | title bar `14px 28px 0`, content `10px 28px 36px` |
| Products | `24px 28px 40px` |
| Product detail | `14px 28px 40px` (breadcrumb `12px 28px 0`) |

### Card padding
| Card type | Padding |
|---|---|
| Dense data card (client-detail tabs, Products, `KpiCard`) | `14px 16px` / `16px 18px` |
| Standard content card | `16–20px` |
| Dashboard section card (Manager/Employee home, Manager portfolio) | `20–24px`, often asymmetric e.g. `20px 28px 8px` |
| Login card | `48px 44px 44px` |
| Alert detail main card | `32px` |
| Meta tiles (alert due-date/status) | `14px 18px` |

### Grid gaps
| Value | Context |
|---|---|
| 8–10px | Compact metric tile rows, market metric rows |
| 12–16px | Card grids, summary/chart rows, table row gaps |
| 18px | Client/heatmap tile grids (`repeat(auto-fill, minmax(288px, 1fr))`) |
| 20–24px | Dashboard section stacks, two-column detail layouts |

---

## Border Radius

| Element | Radius |
|---|---|
| Login card | 24px |
| Client tiles, heatmap product tiles | 18px |
| Manager/Employee home dashboard cards | 20px |
| Content cards (standard) | 16px |
| News cards | 14px |
| Dense data cards (client-detail tabs, Products, KPI cards, ClientHeaderCard) | 12px |
| Buttons (primary), input fields, avatar squircles | 10–12px |
| Heatmap score badge | 7px |
| Cohort/heatmap cells, tag chips | 6px |
| Graph containers, disabled buttons, market-cell variants | 8px |
| Market-distribution table cells | 4px |
| Accent left-border cards (`ClientHeaderCard`, `ProductTile`) | `4px 12px 12px 4px` (asymmetric, paired with `borderLeft: 4px solid <accent>`) |
| Pills / status badges / tags / buttons (pill) | 99px |
| Circular avatars | `50%` |

---

## Shadows

| Context | Value |
|---|---|
| Default card (legacy — client-detail tabs, Products, `KpiCard`, `ClientHeaderCard`) | `0 2px 8px rgba(0,0,0,0.04)` |
| Default card (current standard — Manager/Employee dashboards, VIP/funnel/cohort cards, Alert detail) | `0 2px 12px rgba(0,0,0,0.06)` |
| Floating nav/header pill (`SideNav`, `AppHeader` action pill) | `0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)` |
| Elevated card (login) | `0 8px 48px rgba(0,0,0,0.08)` |
| Search bar | `0 4px 24px rgba(0,0,0,0.08)` |
| Tile hover (client/product/heatmap tiles, brand-tinted) | `0 12px 32px rgba(232,0,28,0.09)` |
| Tile hover (neutral) | `0 4–6px 16–20px rgba(0,0,0,0.07–0.10)` |
| SideNav "last client" deck hover | `0 8px 20px rgba(0,0,0,0.13)` |

---

## Component Patterns

### Cards
- Standard: `background: #fff`, `border: 1.5px solid #E8EBF0`, rounded corners, shadow per
  table above. Two radius/shadow tiers coexist (12px/`0 2px 8px rgba(0,0,0,0.04)` for dense
  data cards vs. 16–20px/`0 2px 12px rgba(0,0,0,0.06)` for dashboard sections) — pick based
  on page density, matching the closest existing page.
- Accent left-border card: `borderLeft: 4px solid <accent>`, `borderRadius: 4px 12px 12px 4px`
  — used for `ClientHeaderCard` and product cards (`ProductTile`/`ProductDetailPage`).
- No dark mode (the `dark:` Tailwind variants present in shadcn primitives are inert
  template artifacts — there's no theme toggle).

### Buttons (Primary)
- `background: #E8001C`, `color: #fff`, `border-radius: 12px`
- Hover: `background: #C40018`
- Disabled: `background: #F0F2F5`, `color: #A0AABB` (radius sometimes 8px for inline CTAs
  rather than 12px — match the surrounding card's radius)

### Buttons (Secondary / Ghost)
- `background: #fff`, `border: 1.5px solid #E8EBF0`, `color: #5A6478` (or `#3A4255` for
  slightly darker body-button text)
- Hover: border darkens to `#C0C8D4`, background may shift to `#F0F2F5` → `#E2E5EA`

### Input Fields
- `border: 1.5px solid #E8EBF0`, `border-radius: 10px`, `background: #FAFBFD`
- Focus: border becomes `#E8001C` (brand red), background becomes `#fff` — this is the
  documented standard. **Inconsistency to be aware of**: `AlertDetailPage`'s result
  textarea instead focuses to blue `#4A90D9`; prefer the red focus for new fields unless
  intentionally matching that screen.

### Navigation (SideNav + AppHeader)
The app shell (`components/Layout.tsx`) renders `AppHeader` + `SideNav` + `<Outlet />` on
every authenticated route.

- **`AppHeader`** (62px): MOEX logo (left, links home) + a white floating pill (right,
  `rounded-2xl`, `p-2`, shadow `0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)`)
  containing a notification bell button and an `Avatar` + `DropdownMenu` (logout).
  Avatar: `36×36px`, `border: 1px solid #D0D4DC`, fallback `bg-[#E8EBF0] text-[#3A4255]`.
- **`SideNav`**: a floating pill fixed to top-center (`top: 8px`), white, `rounded-2xl`,
  same two-layer shadow as the header pill. Contains, left to right:
  1. Collapsible search (40×40 icon → 180px input on click, `bg-[#F0F2F5]`, `rounded-xl`,
     Enter navigates to `/search?q=...`)
  2. Nav icons (Home `/`, Portfolio `/portfolio`, Products `/products`), 40×40px
     `rounded-xl`. Active = `bg-[#E2E5EA] text-[#3A4255]`; inactive = `text-[#A0AABB]`,
     hover `bg-[#F0F2F5] text-[#5A6478]`
  3. A 1px×24px divider (`bg-[#E8EBF0]`), shown only if "last clients" exist
  4. A "last visited clients" deck — overlapping 40×40px rounded cards (logo or initials,
     `border: 1px solid #E0E3E9`), default shadow `0 1px 4px rgba(0,0,0,0.08)`, fanning out
     and lifting (`translateY(-2px) scale(1.02)`, shadow `0 8px 20px rgba(0,0,0,0.13)`,
     border `#C8CDD6`) on hover
- **Role-based home/portfolio**: `HomePage` and `PortfolioPage` are pure dispatchers —
  `store.get().role === 'manager' ? <Manager...Page /> : <Employee...Page />`. Role is set
  on `LoginPage` via a "Руководитель" / "Сотрудник" pill toggle and persisted in
  `localStorage` via `lib/store.ts`.

### Client Tiles
- `border-radius: 18px`, `padding: '22px 22px 20px'`
- Hover: `border: #E8001C`, shadow `0 12px 32px rgba(232,0,28,0.09)`, `translateY(-3px)`,
  transition `border-color 0.18s, box-shadow 0.18s, transform 0.16s`
- Avatar/logo block: 42×42px, `borderRadius: 12`. Shows `client.logo` if present, else a
  fallback SVG (building icon for "Юр. лицо", person icon for individuals); icon stroke
  `#E8001C` if active / `#A0AABB` if inactive; bg `rgba(232,0,28,0.07)` (active, no logo)
  or `#F0F2F5` (inactive, no logo)
- Name row: hover-underline (`textDecorationColor: #E8001C`) + small green "Active" badge
  (17×17px circle, `rgb(39,174,96)`, white check, dark tooltip `#1E2535`/`#fff` on hover) +
  a chevron that fades in on hover
- Tag pills: `rgba(34,197,94,0.10)` bg / `#16a34a` text, `borderRadius: 99`,
  `fontSize: 11, fontWeight: 700, letterSpacing: 0.3`
- ИНН subtitle: `fontSize: 12, color: #A0AABB`
- Bottom row: "Портфель" (15px/700/`#1E2535`) + "Менеджер" (13px/`#5A6478`), each with an
  11px/`#A0AABB` label above

### KPI / Metric Cards
Several variants depending on context:
- **`KpiCard`** (shared component): `background: #fff`, `borderRadius: 14`,
  `border: 1.5px solid #E8EBF0`, `padding: '16px 18px'`, shadow `0 2px 8px rgba(0,0,0,0.04)`.
  Label (`11px/600/#A0AABB`) → value (`22px/700/#1E2535`) → optional delta badge
  (`12px/700`, `#12A05C`/`#E8001C` for positive/negative — see Status & Severity above for
  the canonical positive color).
- **Simple metric + delta** (Employee home): label → big value (`32px/700`) → delta line
  (`12px/600`, color-coded).
- **Plan vs. actual tile** (`MARKET_METRICS`, Manager portfolio): tinted background card
  (`HL_COLORS` red/green/yellow triplets of bg/border/text), label `10px` uppercase, value
  either `"{actual} ({pct}%)/{plan}"` (`13px/800`) or `"{actual} /{plan}"` (`20px/800` +
  `12px` muted plan).
- **Summary metric** (Employee portfolio): label `11px` uppercase → value `22px/800` →
  green sub-text if positive.
- **Ranking `MetricCell`** (VIP table): value (`14px/800` default, configurable size) +
  optional 10px/`#A0AABB` sublabel + optional rank-delta badge positioned top-right.

### Status Pills, Severity Config, Tags
- **Severity config maps** (`ACCENT`, `SEVERITY_CONFIG`, `ALERT_CONFIG`): a recurring
  `Record<key, {border, bg/iconBg, color/iconColor, label}>` shape implementing the
  red/amber/blue three-tier system above — reuse this shape for any new
  alert/task/severity UI.
- **Status pills**: "Просрочено" → danger tier; "в работе" → neutral
  (`#F0F2F5`/`#5A6478`). `fontSize: 11, fontWeight: 700, borderRadius: 99`.
- **Rating/rank badges** (Employee portfolio `RATING_STYLE`/`RANK_STYLE`): A/TOP10 =
  green, B/TOP20 = blue/amber, C/TOP100 = gray; `fontSize: 9-10px/700-800`,
  `borderRadius: 99`.
- **Tag/chip pills**: client category tags (`11px/700/#5A6478` on `#EEF1F5`,
  `borderRadius: 6`); VIP/active green tags (`rgba(34,197,94,0.10)`/`#16a34a`,
  `borderRadius: 99`); news category tags (`background: ${tagColor}18`, text =
  `tagColor`, `borderRadius: 99`).
- **Manager role badges** (`ROLE_STYLE`, additional info): "Персональный менеджер" → blue
  tier; "RM" → amber tier; "Куратор" (default) → neutral.

### Score Tier Tiles (Heatmap)
Used on `/clients/:id/heatmap` and the overview's "Приоритетные продукты" list:
- Two sections: tiles scoring ≥ 70 shown at full opacity, < 70 dimmed to `opacity: 0.7`
- Grid: `repeat(5, 210px)`, `gap: 10`
- Each tile: `aspectRatio: '5/4'`, `border: 1.5px solid <tier-color>`, `borderRadius: 12`,
  hover → `scale(1.02)` + shadow `0 6px 20px rgba(0,0,0,0.09)`
- Layout: icon (36×36, `borderRadius: 9`, `linear-gradient(135deg, ${color}22, ${color}08)`)
  top-left, score badge (`22px/500`, tier-colored pill, `borderRadius: 7`) top-right,
  product name (`13px/700`) center, reason text (`11px`, 3-line clamp) bottom
- A disabled "Подготовить предложение" CTA sits bottom-right (`borderRadius: 8`,
  `#F0F2F5`/`#A0AABB`)
- Score tiers: see [Score & Ranking Colors](#score--ranking-colors) above. Spec also
  documented in `client-portal-front/heatmap.md`.

### Ranking Tables (VIP Clients)
- CSS-grid rows (no `<table>`), columns e.g.
  `'minmax(150px, 1fr) 180px 150px 120px 110px 86px 86px'`
- A decorative 2px vertical red divider (`background: #E8001C`, `position: absolute`)
  separates client-info columns from ranking columns
- Per-row: client logo/name/tags, then `MetricCell`s for market rank, market YoY, overall
  rank (with rank-delta badge), commission, active/total clients, market share, volume YoY
- Sorted strictly by overall rank ascending

### Tables (CSS-grid pattern, generic)
- Header row: `display: grid`, explicit `gridTemplateColumns`, `10–12px/700/#A0AABB`
  uppercase labels; sortable columns get a clickable arrow-icon button
- Data rows: matching grid columns, `borderBottom: 1px solid #F0F2F5` (omit on last row);
  optional `borderLeft: 3px solid <severity color>` accent
- Alternating row shading: odd rows `#FAFBFD`
- Mini progress bars inside cells: `{ width: 44, height: 5, background: '#EEF2F7', borderRadius: 3 }`
  with a colored fill div
- Pagination: shadcn `Pagination`, right-aligned, ellipsis windowing for many pages

### Charts
- **`LineChart`** (SVG, `viewBox="0 0 440 160"`): gridlines `#E8EBF0`; plan line dashed
  `#F7B731`; fact line solid `#2196F3` with `r=3.5` point markers; axis/data labels
  `9–10px`, `#5A6478`/`#A0AABB`/`#F7B731`.
- **`StackedBarChart`** (SVG): `rowH=32`, `gap=8`, `padL=110`; segments `rx=2`, filled
  from `SEG_COLORS`; in-segment value labels `9px/#fff` only if segment width > 18px.
- **Recharts** (bar/donut, Employee portfolio & Client overview): horizontal bars
  `barSize={14}`, radius `[0,3,3,0]`, per-cell color via `Cell fill` (green/red by growth);
  donuts `innerRadius={52}/outerRadius={82}`; tooltip per Chart & Data-Viz Colors above.
- **Sales funnel** (`SalesFunnel`, Manager portfolio): custom CSS trapezoid bands via
  `clip-path: polygon(...)`, gradient fill per stage (see palette above), white text with
  `textShadow`; left annotations show "дошли"/"потеряно"/"купили" pills, right shows a
  conversion-rate pill.
- **Cohort retention matrix** (Manager portfolio): `<table>` with
  `borderCollapse: separate; borderSpacing: 3px`; green-gradient heatmap cells via
  `cellBg(val, maxPct)`; current cohort highlighted with `#1E6FD9` label + inset ring;
  null/future cells `#F6F7FA` with "·"; gradient legend bar below.

### Network Graphs & Contact Card
- Both `ConnectionsGraph` and `DecisionMakersGraph` wrap `@xyflow/react`:
  `{ borderRadius: 8, border: '1px solid #E8EBF0', overflow: 'hidden' }` container,
  `style={{ background: '#F9FAFB' }}` on `<ReactFlow>`, `proOptions={{ hideAttribution: true }}`,
  `nodesConnectable={false}`, invisible `<Handle>`s.
- `ConnectionsGraph`: center "client" card (white, `borderRadius: 10`, `padding: '20px 36px'`,
  shadow `0 2px 8px rgba(0,0,0,0.06)`, `Crown` icon top-left); category-colored connection
  nodes (legal/economic/other, see Chart colors); legend of 8×8 swatches below.
- `DecisionMakersGraph`: org-chart layout (BFS levels / DFS x-positions); person nodes
  132×112px white cards, `borderRadius: 12`, circular 52px avatar via `avatarPalette()`;
  CEO node gets `2px solid #F7B731` border + `Crown` icon + colored shadow
  `0 4px 16px rgba(247,183,49,0.18)`; edges `smoothstep`/`#CBD5E1`; clicking a node opens
  `ContactCard` via `?contact=<name>` query param.
- `ContactCard`: two-column (160px avatar/identity column with `borderRight`, flexible
  details column); 104px circular avatar via `avatarPalette()` (CEO: `2.5px solid #F7B731`
  border + colored shadow); `ContactTile` sub-component for icon+label+value rows;
  "Личные связи" pill chips (blue-tinted, `borderRadius: 99`).

### Calendar / Pagination / Dropdown / Popover / Toggle
These shadcn/base-ui primitives use only Tailwind theme tokens from `index.css`
(`bg-primary`, `bg-muted`, `bg-popover`, `ring-foreground/10`, etc.) — no MOEX-specific
hex values needed when extending them.
- `calendar.tsx` wraps `react-day-picker` v10; uses the `month_grid` classname (renamed
  from `table` in v10 — see git history). Selected/range states use
  `data-selected-single` / `data-range-*` attributes.
- `dropdown-menu.tsx` / `popover.tsx` are built on `@base-ui/react` (not Radix); content
  is `rounded-lg bg-popover ring-1 ring-foreground/10 shadow-md` with
  `animate-in`/`animate-out` zoom/slide transitions keyed on `data-side`.
- `pagination.tsx` and `toggle.tsx` are standard shadcn, theme-token only.

### Loading Skeleton
- White cards with `animation: pulse 1.2s ease-in-out infinite` (opacity 1 → 0.45 → 1),
  matching the surrounding tile's radius/border (e.g. `borderRadius: 18, border: 1.5px solid #E8EBF0`
  for client-tile skeletons on `/search`).

---

## Pages

### Auth
- **`/login`** — Centered card (max-width 440px, `borderRadius: 24`, shadow
  `0 8px 48px rgba(0,0,0,0.08)`, padding `48px 44px 44px`) on `#F6F7FA`. MOEX logo, title
  "Вход в систему" (26px/700) + subtitle, login/password inputs, a **"Роль" pill toggle**
  ("Руководитель" / "Сотрудник") that determines which dashboards the user sees post-login,
  full-width red submit button, footer copyright.

### Home (`/`, role-dispatched)
- **Manager** (`ManagerHomePage`) — max-width 1360px, padding `24px 32px`. A 4-column
  metrics row (one tile links to `/portfolio`); a "Задачи команды" card (VIP/ТОП-30 toggle
  filters, owner-avatar select, CSS-grid task table with severity-accent borders, status
  badges, pagination); a "Последние активности" card (search + date filter + similar grid
  table).
- **Employee** (`EmployeeHomePage`) — max-width 1280px, padding `48px 48px 40px`. A
  4-column KPI row; a two-column row (`1fr 280px`): "Оповещения" (alert list with filter
  tabs, severity-accent rows linking to `/alerts/:id`) + "Быстрые действия" (single
  "Найти клиента" CTA); a full-width "Важные новости" 3-column news grid.

### Search (`/search`)
Reads `?q=` (set via the SideNav search box), debounced (~400ms) filter of `ALL_CLIENTS`
by name/INN. Result-count label (`13px/#A0AABB`) above a
`repeat(auto-fill, minmax(288px, 1fr))` grid of `ClientTile`s (gap 18px). Loading shows 6
pulsing skeleton tiles; empty state shows a centered icon + "Клиенты не найдены" + a red
"На главную" link. Padding `80px 32px 36px`.

### Client Detail (`/clients/:id`)
A shared `ClientLayout` renders `ClientHeaderCard` (accent-left-border card: logo, name +
green "Active" status badge with tooltip, ИНН + creation date, category/rating/public tags,
and two `GaugeRing` SVG donuts for CSI/NPS) above three tab routes:

- **Overview** (index) — vertical stack (`gap: 10`, padding `10px 28px 36px`): an
  **alerts card** (severity-coded rows with counts); a full-width **commission table**
  with mini plan/fact progress bars, where selecting a row reveals a Recharts
  plan-vs-fact bar chart side panel; a 2-column row ("Выручка по РСБУ" /
  "Макросегмент"); a 4-column row (connected products, "Приоритетные продукты" tier-badge
  mini-list linking to the heatmap tab, "Потребности", and a "Доп. информация" tile with
  manager avatars + news preview); a 3-column row ("Учредители" with share bars, "Сфера
  деятельности", "Benchmark" donut charts); and a 2-column row with `ConnectionsGraph` and
  `DecisionMakersGraph`, each expandable to a fullscreen overlay (`?expand=connections`,
  `?expand=dm`, `?contact=<name>`).
- **Heatmap** (`/heatmap`) — product-recommendation scoring grid; see "Score Tier Tiles"
  above.
- **Additional Info** (`/additional-info`) — three stacked cards: "Ответственные
  менеджеры" (`ManagerCard` grid with role badges), "История взаимодействия" (interaction
  table with type badges: Встреча/Звонок/Email/Документ/Презентация, alternating rows),
  and "СМИ" (news feed with branded source favicons/colors and a "+N" count badge).

### Portfolio (`/portfolio`, role-dispatched)
- **Manager** (`ManagerPortfolioPage`) — max-width 1440px, padding `32px 48px`, sections
  with `gap: 20`: market-tab pill row (5 markets) + month picker; plan-vs-actual KPI tile
  row; **VIP Clients ranking table** (see above); a 2-column row with the **sales funnel**
  (left) and **cohort retention heatmap** (right).
- **Employee** (`EmployeePortfolioPage`) — max-width 1400px, padding `40px 48px`. Page
  heading + subtitle; 4-column summary metrics; a two-column charts row (turnover bar
  chart + market-distribution donut); a full-width client table with rating/group tags,
  turnover, and per-market cells (volume + TOP10/20/100 rank badge or "не торгует"), each
  market cell linking to `/portfolio/:clientId/:market`.
- **`/portfolio/:clientId/:market`** (`PortfolioMarketPage`) — generic "В разработке"
  placeholder (centered icon + title/subtitle + red back-link to `/portfolio`). Reuse this
  pattern for any other not-yet-built drill-down page.

### Alerts (`/alerts/:id`)
Max-width 800px, padding `48px 48px 40px`. Ghost back button above a single card
(`borderRadius: 12`, `padding: 32px`, shadow `0 2px 12px rgba(0,0,0,0.06)`): header (severity
icon box 44×44/`borderRadius: 14`, title, status pill, severity-label pill); divider;
clickable client link (logo + blue `#4A90D9` text) to `/clients/:id`; description text;
2-column meta tiles (due date, status — `#F6F7FA` tiles, `borderRadius: 12`); a "Результат"
textarea (focus border `#4A90D9`); primary/secondary action buttons.

### Products (`/products`, `/products/:id`)
- **`ProductsPage`** — title/subtitle, then "Ключевые продукты" (3-column grid with count
  badge) and "Все продукты" (4-column grid) of `ProductTile`s — accent-left-border cards
  (`product.color`, `borderRadius: '4px 12px 12px 4px'`) with a gradient-tinted icon,
  category/highlighted badges, short description, and a 2-column stats footer.
- **`ProductDetailPage`** — breadcrumb, then a two-column layout (`320px 1fr`): sticky
  left panel (icon, badges, name, description, stats, target investors) using the same
  accent-left-border card; right column has full description, key features (bulleted),
  and an audience/risks card with green/red icon chips. Ends with a ghost "Все продукты"
  back button. Data source: `src/lib/products.json`.
