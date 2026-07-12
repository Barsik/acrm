# MOEX aCRM — Design System (acrm_se)

> **What this is.** The living style guide for the **`acrm_se`** prototype — the analytical
> CRM front for the Московская Биржа Group (aCRM + oCRM + ЕХД). It is derived by auditing
> the live source (Jul 2026), not from a static handoff. It supersedes the earlier
> `client-portal-front` guide that used to live here: that document described a different
> app (routes `/login`, `/search`, `/clients/:id`, `/portfolio`) and no longer matches this
> codebase. Where this guide says "canonical", follow it for new work; where it says
> "drift" or "inconsistency", it is describing what exists so you can match a neighbouring
> screen — and, ideally, converge over time.

---

## 0. TL;DR for contributors

- **Brand red is `#E8001C`.** Page bg `#F6F7FA`, cards white, hairline border `#E8EBF0`,
  primary text `#1E2535`.
- **Prefer the shared layer**: CSS component classes in [`src/index.css`](../../src/index.css)
  (`.card`, `.btn-primary`, `.data-table`, `.badge-*`, `.input`, `.tag`, `.atable`, …) and
  React primitives in [`src/components/common/index.tsx`](../../src/components/common/index.tsx)
  (`Card`, `PageTitle`, `KPICard`, `ScoreBadge`, `StatusBadge`, `AlertItem`, `AIInsightCard`, …).
- **Three visual layers coexist** (see §2). New screens should be built on layer 1 (MOEX
  tokens/components). Layer 2 (raw Tailwind `slate/blue/green`) is legacy drift; layer 3
  (the `.atable` "report" skin) is intentional and scoped to Рынки / product analytics.
- **Fonts**: PT Sans, only 400 & 700 are loaded (weights 600/800/900 appear in code and are
  synthesized by the browser). Numeric values use `tabular-nums`.
- When in doubt, copy the closest existing page rather than inventing new tokens.

---

## 1. App at a glance

Multi-role analytical portal. There is **no login** — the entry point is a **role picker**
([`RoleSelect`](../../src/pages/RoleSelect.tsx)); role is held in React context
([`AppContext`](../../src/context/AppContext.tsx)), not persisted (only the menu position is,
under `localStorage['acrm_menu_position']`).

**Roles** (`UserRole`): `ceo` · `block_head` · `market_lead` · `manager` · `operations`.
Each has a home dashboard (`/ceo`, `/block-head`, `/market-lead`, `/manager`, `/operations`).

**Route map** ([`App.tsx`](../../src/App.tsx)):

| Group | Routes |
|---|---|
| Entry | `/role-select`, `/` (redirects to role home) |
| Role dashboards | `/ceo`, `/block-head`, `/market-lead`, `/manager`, `/operations` |
| Entities | `/holdings`, `/holdings/:id`, `/clients`, `/companies/:id`, `/persons`, `/persons/:id` |
| Work | `/alerts`, `/tasks`, `/activity`, `/agreements`, `/events`, `/news` |
| Analytics | `/products`, `/markets`, `/funnel`, `/strategy`, `/cohorts`, `/settings` |

> The nav pill lists a few items whose routes are **not implemented** (`/kpi`,
> `/initiatives`, `/knowledge`, `/ai`); the catch-all `*` route redirects them back to
> `/role-select`. Treat these as roadmap placeholders.

**Stack**: React 19 + TS (strict) · Vite · React Router · Recharts · lucide-react · Tailwind
(utilities + a small set of `@apply` component classes in `index.css`). `src/App.css` is dead
Vite boilerplate — not imported anywhere.

---

## 2. The three styling layers (read this first)

The single most important thing to understand about this codebase is that **styling is not
uniform**. Three approaches are interleaved, sometimes within one file:

### Layer 1 — MOEX component layer *(canonical — build here)*
- CSS classes in `index.css`: `.card`, `.kpi-card`, `.btn-primary/-secondary/-danger/-success`,
  `.badge-{green,red,amber,blue,purple,gray}`, `.section-title`, `.input`, `.tag`,
  `.data-table`, `.tab-button`, `.alert-{critical,high,medium,low}`, `.float-pill`,
  `.sidebar-link`, `.tnum`.
- React primitives in `components/common/index.tsx` (inline styles with literal MOEX hex).
- **Use these for anything new.** They encode the tokens in §3.

### Layer 2 — Raw Tailwind palette drift *(legacy — matching only)*
Widespread use of stock Tailwind scales instead of MOEX tokens:
`text-slate-900/700/600/500/400`, `bg-slate-50/100/200`, `bg-blue-100 text-blue-700`,
`bg-green-50 border-green-100 text-green-700`, `text-violet-600`, `bg-amber-50 text-amber-600`,
`bg-red-100 text-red-700`, gradient avatars `bg-gradient-to-br from-blue-700 to-blue-900`,
focus rings `focus:ring-blue-500`. Heaviest in the **entity detail pages** (`HoldingPage`,
`CompanyPage`, `PersonPage`) and the **role dashboards** (`CEO`, `BlockHead`, `MarketLead`,
`Manager`). Functionally these `slate/blue/green` values sit close to the MOEX neutrals/accents
but are **not** the same hexes — this is the main source of visual inconsistency (§10).

### Layer 3 — Analytics "report" skin *(intentional, scoped)*
Used by [`MarketsPage`](../../src/pages/MarketsPage.tsx) and
[`ProductAnalyticsTable`](../../src/pages/ProductAnalyticsTable.tsx). A dense, print-report
aesthetic: the `.atable` class, `font-extrabold` (800/900) headings, `bg-slate-900` pill tabs,
sparklines, a distinct data palette (green `#187A40`, red `#E30613`, orange `#C85A08`, blue
`#2B63B8`, purple `#6B35C8`), and its **own** local `Card` (`border border-slate-200 rounded-lg
shadow-sm`) rather than `.card`. Keep this skin for market/product analytics tables; don't mix
it into transactional screens.

---

## 3. Color tokens

### 3.1 Brand & neutrals (canonical)

| Token / role | Hex | Usage |
|---|---|---|
| Brand red | `#E8001C` | Primary actions, active brand accent, danger, negative deltas |
| Brand red hover | `#C40018` | Primary button hover |
| Page background | `#F6F7FA` | App bg, header bg, inset tiles |
| Surface | `#FFFFFF` | Cards |
| Border | `#E8EBF0` | Card borders (1.5px), dividers, inputs |
| Text primary | `#1E2535` | Headings, values |
| Text secondary | `#5A6478` | Labels, body-2, secondary-button text |
| Text tertiary | `#3A4255` | Body copy, active nav label, avatar initials |
| Muted | `#A0AABB` | Placeholder, metadata, micro-labels, table headers |
| Chip / neutral fill | `#F0F2F5` | Pills, secondary/disabled buttons, search field, `--muted` |
| Neutral hover | `#E2E5EA` | Active nav item bg, pill hover |
| Secondary hover border | `#C0C8D4` | Ghost-button hover border, muted bullets |
| Avatar border | `#D0D4DC` | Header avatar / logo tiles |
| Zebra / focus-field bg | `#FAFBFD` | Table hover, alternating rows, input focus bg |
| Scrollbar thumb | `#C0C8D4` → `#A0AABB` (hover) | Custom 6px scrollbar (`index.css`) |

### 3.2 Semantic (three-tier: danger / warning / info + positive)

| Tier | Solid / icon | Tinted bg | Text-on-tint |
|---|---|---|---|
| Danger | `#E8001C` | `#FDE7EA` / `rgba(232,0,28,0.05)` | `#E8001C` |
| Warning | `#F5A623` (chart var. `#F7B731`) | `#FEF3E2` / `rgba(247,183,49,0.08)` | `#B07800` |
| Info | `#4A90D9` (chart var. `#2196F3`) | `#EBF4FC` | `#1565C0` |
| Positive | `#12A05C` (hover `#0E7E48`) | `rgba(18,160,92,0.10)` | `#12A05C` |
| Violet / strategic | `#9B59B6` | `rgba(155,89,182,0.12)` | `#7A3B93` |

- **Positive delta = `#12A05C`, negative = `#E8001C`.** `TrendArrow` renders `▲/▼ X.X%`.
- `SeverityBadge` uses **solid bg + white text** (critical red / high amber / medium blue /
  low muted); `StatusBadge` and `.badge-*` use **tinted bg + colored text**.

### 3.3 Chart & data-viz palettes

| Context | Colors |
|---|---|
| Recharts line — fact / prev | fact `#2196F3` (solid), prev/plan `#CBD5E1` (dashed `4 4`), grid `#F1F5F9` |
| `MARKET_COLORS` (CEO bars) | `#4A90D9, #9B59B6, #0D7377, #F5A623, #E8001C, #12A05C` |
| `PIE_COLORS` (MarketLead) | `#4A90D9, #9B59B6, #0D7377, #F5A623, #E8001C` |
| `BUSINESS_LINES` (Markets) | Фонд `#2B63B8`, Сроч `#187A40`, Вал `#C85A08`, Ден `#6B35C8` |
| Product analytics markets | equity `#2B63B8`, derivatives `#187A40`, fx `#C85A08`, money `#6B35C8`, commodity `#0E7490` |
| Funnel stages (5) | `#5b8def, #36c2cf, #7b6ef6, #f0883e, #2ec27e` (band = `linear-gradient(180deg, c, shadeDark(c,-18))`, white text + shadow) |
| Cohort heatmap | green ramp `rgba(46,194,126, 0.10→0.98)`, null cell `#F6F7FA`, text `#04110a` |
| Recharts tooltip | `contentStyle={{ borderRadius: 8–10, border: '1px solid #E8EBF0', fontSize: 12 }}` |

### 3.4 Product-status palettes (two exist)

**ActivityMonitor** cell tint (`PRODUCT_STATUS_STYLE`, MOEX-tinted):

| Status | bg / fg |
|---|---|
| Активно торгует | `rgba(18,160,92,0.12)` / `#0F8A4E` |
| Подключен к бою | `rgba(18,160,92,0.08)` / `#12A05C` |
| Подключен | `#EBF4FC` / `#1565C0` |
| Перспективный | `rgba(155,89,182,0.10)` / `#7A3B93` |
| Низкая активность | `#FEF3E2` / `#B07800` |
| Не торгует | `#FDE7EA` / `#E8001C` |
| Нет интереса | `#FDE7EA` / `#C0334A` |
| Нет статуса | `#F0F2F5` / `#5A6478` |

**ProductsPage** donut (`STATUS_COLOR`, flat-UI palette — a different set):
`#2ecc71, #1abc9c, #3498db, #9b59b6, #f39c12, #e74c3c, #e67e22, #95a5a6`.

### 3.5 Ranking palette (ClientsPage / Markets report)

A separate "report" red/green/gray used in the VIP ranking and analytics tables — **note the
different red**: green `#187A40`, red **`#E30613`** (vs brand `#E8001C`), gray `#9CA3AF` /
`#717171` / `#ADADAD`, delta pills `#E7F6EC`/`#187A40` (up) and `#FDE8E8`/`#E30613` (down).
`rankColor(rank) → ≤5 green · ≤10 dark · else gray`.

---

## 4. Typography

**Font:** PT Sans (Google Fonts, `@import` in `index.css`), **weights 400 & 700 loaded**.
Weights 600 / 800 / 900 appear throughout (KPI values, `font-extrabold` report headers,
`Big` ranking numbers) and are **faux-bolded** by the browser. No italics.

| Size | Weight | Where |
|---|---|---|
| 28px | 700 | Clickable stat-tile counts (Alerts, Tasks) |
| 26px | 700 | `PageTitle` h1 (dashboards, Alerts, Tasks, Settings) |
| 24px (`text-2xl`) | 700 | List-page h1; `KPICard` / `.kpi-card` value (Operations, Events) |
| 22px | 800 | Funnel/StatCard values (heavy variant) |
| 20px | 700/800 | Entity header name (`text-xl`), funnel band value, metric tiles |
| 15px | 700/800 | `.section-title`, `SectionHeader`, card titles, Markets `SectionHead` (800) |
| 13px | 400/600/700 | Body, table cells, buttons, `.data-table td` |
| 12px | 400/700 | Secondary text, meta rows, filter selects |
| 11px | 700 | Uppercase labels (KPI/stat labels), `.badge`, `.atable` body |
| 10px | 600/700 | Micro uppercase labels (table cols, tags), `letterSpacing 0.5–0.8px` |
| 9px | 700/800 | `.atable` header, chart annotations, smallest labels |

**Conventions:** `fontVariantNumeric: 'tabular-nums'` (or `.tnum`) on every numeric value;
uppercase labels get `letterSpacing 0.5–0.8px` or `0.06–0.1em`; heavy metric values commonly
use 800.

---

## 5. Spacing, radius, elevation

### Radius

| Element | Radius |
|---|---|
| `.card` (standard content) | 16px |
| `.kpi-card`, entity header card, Funnel/Settings cards | 12px |
| List-page icon chip, avatar squircles, buttons (`.btn-*`, `.input`) | 10–12px |
| Nav/search pill items, `.float-pill` | 12 / 16px |
| Analytics `Card` (Markets) | 8px (`rounded-lg`) |
| Badges, pills, tags, progress tracks | 99px |
| Circular avatars / dots | 50% |
| Accent-left card (Alerts) | `4px 16px 16px 4px` (paired with `borderLeft: 4px solid`) |
| Cohort cells, small chips | 6px |

### Shadow

| Context | Value |
|---|---|
| `.card` (standard) | `0 2px 12px rgba(0,0,0,0.06)` |
| `.kpi-card` / KPICard | `0 2px 8px rgba(0,0,0,0.04)` |
| `.float-pill` (header + nav) | `0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)` |
| Analytics `Card`, Funnel tabs | `shadow-sm` / `0 2px 8px rgba(0,0,0,0.06)` |
| KPICard hover (clickable) | `0 8px 22px rgba(232,0,28,0.08)` + `translateY(-2px)`, border → red |
| RoleSelect card hover | `0 10px 28px rgba(0,0,0,0.08)` + `translateY(-2px)`, border → accent |
| Active stat/filter tile | `0 4px 16px ${accent}1F` |

### Spacing & grids

- **Page shell** ([`Layout`](../../src/components/layout/Layout.tsx)): `main` padding
  `20px 32px 40px`. Top-menu mode → `maxWidth 1600`, centered. Left-menu mode → full width,
  `paddingLeft 220`.
- **KPI rows**: `grid-cols-2 md:grid-cols-4`, gap `12–16px`.
- **Dashboard body**: `grid-cols-1 lg:grid-cols-3` (main `lg:col-span-2` + sidebar), gap 16px.
- **Card grids / tile rows**: gap `10–16px`; section stacks `gap 16–20px`.
- **Card padding**: content `20px` (`Card` default) · dense `14–18px` · dashboard sections
  `p-4 / p-5` · entity header `p-5` · RoleSelect card `20px` · Alert/Settings card `20 / 24px`.

---

## 6. Navigation shell

### AppHeader ([`Header.tsx`](../../src/components/layout/Header.tsx)) — 62px
- Sticky, `bg #F6F7FA`, padding `0 28px`. MOEX wordmark left (26px, links to `/`).
- Right: a `.float-pill` action cluster — **Settings** (→ `/settings`), **Bell** with a red
  `4` badge, and a **role avatar + dropdown** (30×30 squircle, `bg #E8EBF0` / `#3A4255`
  initials — `CEO/РБ/PM/КМ/ОП`; dropdown has "Сменить роль", which clears the role).
- In **left-menu mode** the global search (`SearchBox variant="bar"`, 320px) sits inline after
  the logo, aligned to the work-area column.

### SideNav ([`Sidebar.tsx`](../../src/components/layout/Sidebar.tsx)) — floating pill
Two positions, chosen in **Settings** (`menuPosition`, persisted):

- **Top** (default): centered pill `top:8`, `maxWidth calc(100vw − 360px)`. Collapsible search
  puck + icon-only buttons (40×40, `rounded-12`). Active `bg #E2E5EA` / `#3A4255`; inactive
  `#A0AABB`, hover `bg #F0F2F5` / `#5A6478`. Badges = red pill top-right.
- **Left**: vertical pill `left:12`, vertically centered, 196px, scrollable. Icon **+ label**
  rows (`9px 12px`, `rounded-12`); active `bg #E2E5EA`, label `#1E2535`/700; badge red pill at
  row end. Search relocates to the header.

Nav items (icons from lucide, `size 18 strokeWidth 1.8`): Главная · Задачи `8` · Алерты `5` ·
Монитор активности · Продукты · Воронка продаж · Рынки · Клиенты · Персоны · Мероприятия · KPI ·
Инициативы · База знаний · AI.

### SearchBox ([`SearchBox.tsx`](../../src/components/layout/SearchBox.tsx))
Live global search (≥2 chars) with a `.card` dropdown (width 340), results grouped
**Холдинги / Компании / Персоны / Задачи**, each row a colored initial chip
(`${hex}18` bg / solid `hex`): holdings red, companies violet, persons green, tasks amber.
`pill` variant collapses 40→200px; `bar` variant is fixed-width and always open.

---

## 7. Shared components ([`common/index.tsx`](../../src/components/common/index.tsx))

Public prop signatures are stable; pages consume these rather than re-styling.

- **`Card`** — `background #fff`, `1.5px #E8EBF0`, radius 16, shadow `0 2px 12px .06`, padding
  20 (override via `padding`). Mirror of the `.card` CSS class.
- **`PageTitle`** — `{icon?, accent=red, title, subtitle?, actions?}`. Tinted icon box 44×44
  (`${accent}14` bg, `${accent}26` border), h1 26/700, subtitle 13/`#5A6478`, actions right.
  Used by dashboards, Alerts, Tasks, Settings. *(List pages use an ad-hoc title header instead
  — see §10.)*
- **`KPICard`** — radius 14, shadow `0 2px 8px .04`. Label 11/700 upper muted → value 24/700
  tabular → optional `sub` and delta line (`change:{current,prev}` → `▲/▼ % к прошлому году`,
  green/red). `accent ∈ blue|violet|green|red|amber` (note: **`blue` maps to brand red**).
  Clickable variant lifts + red border on hover.
- **`ScoreBadge`** — `{score, type: health|risk|growth, size, showLabel}`. Tinted pill; risk is
  inverted (high score = red). health/growth: ≥80 green · ≥50 amber · else red. In table cells
  `showLabel={false}` shows the number only.
- **`SeverityBadge`** — solid pill, white text: critical `#E8001C` · high `#F5A623` · medium
  `#4A90D9` · low `#A0AABB` (labels Критично/Высокий/Средний/Низкий).
- **`StatusBadge`** — tinted pill; **15 statuses** mapped in one `STATUS` record (active,
  declining, inactive, new, churned, in_progress, done, open, overdue, on_track, at_risk,
  behind, achieved, expiring, expired, …) → green/amber/red/blue/gray tiers. Extend this record
  rather than hand-rolling status pills.
- **`AlertItem`** — left-accent row (`borderLeft 4px`, tinted bg), severity icon, title +
  `SeverityBadge`, description, date + optional action link.
- **`ProgressBar`** — track `#EEF2F7`, height 6, radius 99; fill color keyword
  (`blue`→red, `green`, `red`, `amber`, `violet`).
- **`SectionHeader`** — 15/700 title + optional subtitle + right-aligned actions.
- **`EmptyState`** — centered muted icon-in-circle + title + description.
- **`AIInsightCard`** — `{title, body, confidence, type}`. Tinted card per `type`
  (summary=info, opportunity=green, risk=red, next_action=violet, cross_sell=amber); header
  `AI · <label>` in red + confidence %.
- **`TrendArrow`** — `{current, prev}` → `▲/▼ X.X%` (green/red) or `—`.

---

## 8. UI patterns & recipes

### Buttons (`index.css`)
- **Primary** `.btn-primary`: `#E8001C` bg, white, radius 12, hover `#C40018`; disabled
  `#F0F2F5`/`#A0AABB`. (`.btn-danger` = same; `.btn-success` = `#12A05C`/hover `#0E7E48`.)
- **Secondary/ghost** `.btn-secondary`: white, `1.5px #E8EBF0`, text `#3A4255`; hover bg
  `#F0F2F5`, border `#C0C8D4`. Common inline overrides tint text amber/green for
  escalate/close actions.

### Inputs & filters
- Canonical `.input`: `1.5px #E8EBF0`, radius 12, bg white, **focus border `#E8001C`**.
- **Drift to know about**: many raw inputs use `border-slate-200 … focus:ring-blue-500`
  (Holdings/Clients/Persons/Events/Cohorts search & selects); filter selects elsewhere use
  `focus:border-moex-red`. Prefer the red focus for new fields.
- Segmented/pill filters: active `bg-slate-900|#1E2535|#E8001C text-white`, inactive
  `#F0F2F5`/`#5A6478` — several variants exist per page.

### Cards & tables
- **Standard card**: `.card` (or `<Card>`). Section header row inside cards is often
  `px-5 py-4 border-b border-slate-100`.
- **Transactional table**: `.data-table` — transparent uppercase header (12/700, `#A0AABB`),
  rows 13px `#5A6478`, divider `#F0F2F5`, no last-row border, hover `#FAFBFD`, tabular-nums.
  Wrap in `.card overflow-hidden` + `overflow-x-auto`.
- **Analytics table**: `.atable` — header `#F4F4F4` 9px/800 upper `#717171`, cells 11px
  `#1C1C1C`, hover `#F4F4F4`, grouped column headers with a colored 2px underline; sortable
  headers add `↑/↓`; mini bars `height 4, width 80, track #E6E6E6`.

### Stat / filter tiles (Alerts, Tasks, Operations, Events)
Clickable `.card` buttons: value 28/700 in an accent color, 11px upper label. Selected state
sets `borderColor: accent`, `background: ${accent}0A`, `boxShadow: 0 4px 16px ${accent}1F`.

### Entity detail pages (Holding / Company / Person)
Header card (`bg-white rounded-xl border p-5 shadow-sm`, **not** `.card`): gradient avatar
48×48, name (`text-xl`) + segment/status badges, right-side `ScoreBadge` trio, then a 6-column
KPI strip above a `border-t`. Below: an action-button row, then `.tab-button` tabs
(underline-on-active, red) driving tab panels. Unbuilt tabs render the placeholder card
(`rounded-xl border p-8 text-center` "Раздел … в разработке").

### Charts
- **Recharts** everywhere for line/bar/pie: axes 11px, grid `#F1F5F9`, fact `#2196F3`, prev
  `#CBD5E1` dashed, per-cell colors from the palettes in §3.3. Donut `innerRadius 54 /
  outerRadius 82` with center label + right legend (Markets); pie slice labels white 12/700.
- **SalesFunnel** ([`FunnelPage`](../../src/pages/FunnelPage.tsx)): CSS `clip-path` trapezoid
  bands, gradient fill, white text w/ shadow; left "дошли/потеряно/купили" pills, right
  conversion pill. **Cohort matrix**: `borderSpacing 3px`, green-ramp cells, gradient legend.
- **Sparklines** (Markets): inline 54×18 SVG polylines colored by `trendInfo` slope.

### Formatters (reuse — do not re-implement)
- `formatRevenue` / `formatVolume` / `formatPercent` — [`mockData.ts`](../../src/data/mockData.ts)
  (`млрд/млн/трлн ₽`, ru locale).
- `fmtMoney` / `fmtMln` / `fmtThousands` / `trendInfo` — [`markets.ts`](../../src/data/markets.ts).
- `heatFmt` — [`heatmap.ts`](../../src/data/heatmap.ts).

---

## 9. Page-by-page notes

- **RoleSelect** `/role-select` — full-bleed (no shell): white top bar, hero pill + h1 28,
  3-col grid of role cards (`.card`, hover → accent border + lift), each with tinted icon,
  level tag, "Решения/Данные" lists; footer legend (aCRM/oCRM/ЕХД dots).
- **CEO** `/ceo` (violet) — 4 KPI + 2/3 split: revenue line, market bars, top-20 table |
  AI-query panel, AI insights, alerts, opportunities, action list.
- **BlockHead** `/block-head` (red) — team-portfolio table (plan `ProgressBar`, risk badges) +
  revenue line + holdings-at-risk list | AI summary, opps, tasks, actions.
- **MarketLead** `/market-lead` (blue) — market pill filter, funnel bar, market table,
  potential-clients table | segment pie, AI, alerts, actions.
- **Manager** `/manager` (green) — Годовой KPI tiles (status + `ProgressBar`), **Тепловая
  карта** (search/segment/alert/sort filters, custom pager, alert-icon chips, `.tag` product
  pills), KPI row, holdings table, tasks | alerts, expiring docs, opps, news, actions, AI.
  *Contains a blue gradient "attention today" panel — a one-off.*
- **Operations** `/operations` (slate) — 4 `.kpi-card` stats, tab filter, requests table with
  `SLABar` (green/amber/red), sticky detail side-panel.
- **HoldingsList / Clients** — search + segment pill + sort; `.data-table` of holdings with
  Score/Status/Trend. **Clients** adds a second **ranking panel** (own table, `Big` numbers,
  `DeltaPill`, market switch) using the §3.5 report palette.
- **Company / Person / PersonsList** — detail tabs & profile cards (heavy layer-2 Tailwind);
  `influenceColors`/`vipColor` badge maps; VIP `ProgressBar`.
- **Alerts** `/alerts` — `PageTitle` + clickable severity stat tiles + accent-left alert cards
  (`4px 16px 16px 4px`), recommended-action inset, action buttons.
- **Tasks** `/tasks` — `PageTitle` + segmented "Срок" + Тип/Приоритет selects + stat tiles +
  `.data-table` with "Инициатива" chip and priority pills.
- **ActivityMonitor** `/activity` — wide matrix: client rows × product columns, cells tinted by
  `PRODUCT_STATUS_STYLE`; alert-icon chips; group/category/restriction/market filters.
- **Agreements / News / Events** — `.data-table` (Agreements, expiring rows amber-tinted);
  sentiment-bordered news cards; Events filter card + 3 stats + recommended-guest table.
- **Products** `/products` — status donut (flat-UI palette, 3-col filters + legend) +
  embedded `ProductAnalyticsTable` (`.atable`, sortable, penetration bars).
- **Markets** `/markets` — the layer-3 report: `.atable` sections (Доход, Объём, клиенты, ср.
  доход, помесячно, ADTV), donuts, sparklines, collapsible Recharts line charts, period pickers.
- **Funnel** `/funnel` — market tabs (red pill), HL metric tiles, trapezoid `SalesFunnel`,
  cohort matrix, monthly sales/churn `ComposedChart`.
- **Strategy / Cohorts** — strategy: bar chart + `.data-table` with gap coloring & progress;
  cohorts: builder (`showBuilder`) + saved-cohort cards.
- **Settings** `/settings` — `PageTitle` + a single card with two menu-position options, each a
  mini schematic `MenuPreview`; selected = red border + tinted bg + red check.

---

## 10. Known inconsistencies & consolidation guidance

As the design audit, these are the gaps between screens. They are **not bugs** — they're drift
to converge on when touching a screen. Ranked by visual impact:

1. **Two brand reds.** `#E8001C` (canonical) vs `#E30613` (Clients ranking, Markets report).
   → Standardize on `#E8001C`; keep `#E30613` only inside the scoped report skin if matching.
2. **Raw Tailwind `slate/blue/green` vs MOEX tokens.** Entity-detail and dashboard pages lean on
   `text-slate-*`, `bg-blue-100/text-blue-700`, `bg-green-50`, `text-violet-600`, gradient
   avatars. → New work uses `.card`/`.badge-*`/tokens; when editing a legacy page, prefer nudging
   toward tokens over adding more `slate/blue`.
3. **Multiple greens** in play: `#12A05C` (canonical), `#187A40` (report), `#0F8A4E`
   (ActivityMonitor), `#2ecc71`/`#2ec27e` (donut/funnel). → Use `#12A05C` for UI positives.
4. **Card tiers are ad-hoc.** `.card` (r16/`.06`) vs entity headers `rounded-xl` + `shadow-sm`
   vs Markets `rounded-lg` (r8). → Pick the closest neighbour; default to `.card`.
5. **Focus styles split**: `.input` → red; raw inputs → `focus:ring-blue-500`; some selects →
   `focus:border-moex-red`. → Red focus is the intended standard.
6. **Two page-title patterns**: `PageTitle` (dashboards, Alerts, Tasks, Settings) vs an inline
   `flex items-center gap-3` header with a colored `bg-*-100` icon chip (list pages). → Prefer
   `PageTitle` for consistency; if using the inline one, at least keep the icon-chip color tied
   to the page's accent.
7. **Faux weights.** 600/800/900 are used but only 400/700 are loaded. → Either load the extra
   weights or restrict to 400/700; today the browser synthesizes them.
8. **Two product-status color systems** (`PRODUCT_STATUS_STYLE` MOEX-tinted vs `STATUS_COLOR`
   flat-UI) for the same status vocabulary. → Unify on the MOEX-tinted set for status *chips*;
   the flat set is only defensible as saturated *chart* fills.
9. **Priority pills** are re-hand-rolled per page (`bg-red-100 text-red-700`, …) instead of a
   shared component. → Consider a `PriorityBadge` mirroring `SeverityBadge`.
10. **Dead assets**: `src/App.css` (Vite boilerplate) is unused; nav lists routes that don't
    exist (`/kpi`, `/initiatives`, `/knowledge`, `/ai`). → Remove or implement.

---

## 11. File map

| Concern | File |
|---|---|
| Tokens as CSS classes | [`src/index.css`](../../src/index.css) |
| Shared React primitives | [`src/components/common/index.tsx`](../../src/components/common/index.tsx) |
| App shell | [`Layout`](../../src/components/layout/Layout.tsx) · [`Header`](../../src/components/layout/Header.tsx) · [`Sidebar`](../../src/components/layout/Sidebar.tsx) · [`SearchBox`](../../src/components/layout/SearchBox.tsx) |
| Role/state | [`AppContext`](../../src/context/AppContext.tsx) · [`types`](../../src/types/index.ts) |
| Routing | [`App.tsx`](../../src/App.tsx) |
| Report skin & data | [`markets.ts`](../../src/data/markets.ts) · [`ProductAnalyticsTable`](../../src/pages/ProductAnalyticsTable.tsx) · [`mockDatabase.ts`](../../src/data/mockDatabase.ts) |
| Formatters | [`mockData.ts`](../../src/data/mockData.ts) · [`heatmap.ts`](../../src/data/heatmap.ts) |
</content>
</invoke>
