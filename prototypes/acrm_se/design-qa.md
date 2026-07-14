# Design QA — блок «Привлечение»

- Source visual truth: supplied acquisition reference screenshot
- Implementation screenshot: local browser QA capture
- Viewport: 1280 px desktop, responsive layout state
- State: «Сравнение с рынком» → «Привлечение» → «Доля по клиентам»
- Full-view comparison evidence: source and implementation were inspected at the same desktop state. The implementation preserves the source hierarchy (lifecycle tabs, analytical introduction, dominant chart, compact comparison summary) while extending the chart from two lines to the requested stacked competitor composition.
- Focused-region evidence: the acquisition chart, metric switcher, legend, period total, market share and average-growth panel were inspected separately because their labels and interaction state are not readable at full-page scale.

**Findings**

- No remaining P0/P1/P2 issues.
- Typography: PT Sans, compact labels, numeric hierarchy and weights are consistent with the existing MOEX prototype and the source reference.
- Spacing/layout: chart remains the dominant surface; summary and growth context sit in a narrow right rail; no horizontal page overflow at 1280 px.
- Colors/tokens: MOEX red marks the broker, competitor colors remain distinct, and the rest of market is visually subordinate.
- Image/asset fidelity: the source contains no raster imagery or custom icons that require recreation; the chart uses the existing Recharts implementation.
- Copy/content: accounts, clients, account share, client share, nearest competitors, period total and average growth are all represented.

**Comparison history**

1. Initial browser pass found a P2 numeric formatting defect: the normalized share axis rendered `100.00000000000001%`.
2. Fixed the axis formatter by rounding normalized tick values.
3. Post-fix browser evidence shows `100%`, all four metric modes are selectable, the page has no horizontal overflow, and the browser console has no errors or warnings.
4. Follow-up pass added `Рынок в целом` to the CAGR comparison. Browser verification confirms the market row is visible in both clients and accounts modes and recalculates from the corresponding aggregate flow.
5. Activation follow-up added three activation indicators with absolute-client and activation-share modes. All six combinations were exercised in the browser; the market benchmark is volume-weighted, layout has no horizontal overflow, and the console remains clean.
6. Portfolio follow-up added turnover, AuC and MAU with absolute-volume and market-share views. All metrics and both views were exercised; totals, latest share and CAGR benchmarks update together, with no overflow or console errors.
7. Lifecycle navigation was reordered to `Привлечение → Активация → Активность → Отток`; the former portfolio stage is now labeled and numbered as `03 · Активность`, churn as `04 · Отток`, and retention is removed from this navigation. All four transitions were browser-verified.
8. Churn follow-up added dormant, zero-AuC and account-closure events with absolute totals, market-outflow shares and CAGR comparisons. All six metric/view combinations were tested; the market comparison is visible, layout has no overflow and the console is clean.

**Primary interactions tested**

- Opened «Сравнение с рынком».
- Switched between «Счета», «Клиенты», «Доля по счетам» and «Доля по клиентам».
- Confirmed chart, total, share and growth calculations update with the selected unit.
- Checked browser console: no errors or warnings.

**Implementation Checklist**

- [x] Stacked monthly market flow
- [x] Broker and nearest-competitor split
- [x] Accounts/clients/share switcher
- [x] Average monthly growth comparison
- [x] Whole-market CAGR benchmark
- [x] Three activation indicators
- [x] Absolute and share activation views
- [x] Volume-weighted market activation benchmark
- [x] Turnover, AuC and MAU portfolio metrics
- [x] Absolute volume and market-share portfolio views
- [x] Broker, competitor and whole-market CAGR comparison
- [x] Four-stage lifecycle order and numbering
- [x] Three churn-event metrics
- [x] Churn totals, market shares and CAGR comparison
- [x] Month-over-month change in absolute values and percentages
- [x] Grouped delta benchmark against competitors and the whole market
- [x] All four churn chart modes verified with a clean console
- [x] Ranking workspace reduced to ratings and group comparison
- [x] Portfolio analytics split into dynamics and structure
- [x] Client lifecycle dynamics moved into portfolio analytics
- [x] Behavioral portfolio and AuC segment comparison tables implemented from the supplied reference
- [x] Structure tables preserve broker, competitor, market, share, and segment context
- [x] Responsive layout and clean console

**Follow-up Polish**

- P3: real production data can replace mock values without changing the component contract.

final result: passed
