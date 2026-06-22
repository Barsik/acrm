import { useState } from 'react';
import { Filter } from 'lucide-react';
import {
  ComposedChart, Bar, Line, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Layout } from '../components/layout/Layout';

type MarketKey = 'forex' | 'equity' | 'metals' | 'bonds' | 'pifs';

interface MetricTile {
  label: string;
  actual: string;
  plan?: string;
  pct?: number;
  highlight?: 'red' | 'green' | 'yellow';
}

interface FunnelStage {
  label: string;
  icon: string;
  value: number;
  color: string;
}

const MARKET_TABS: { key: MarketKey; label: string }[] = [
  { key: 'forex',  label: 'Валютный рынок' },
  { key: 'equity', label: 'Рынок Акций' },
  { key: 'metals', label: 'Рынок драгметаллов' },
  { key: 'bonds',  label: 'Рынок облигаций' },
  { key: 'pifs',   label: 'Рынок ПИФов' },
];

const MARKET_METRICS: Record<MarketKey, MetricTile[]> = {
  forex: [
    { label: 'Комиссионный доход, млн.руб.',  actual: '3 764',  plan: '4 839',  pct: 78,  highlight: 'red' },
    { label: 'Кол-во клиентов ФЛ, тыс.чел.', actual: '180',    plan: '229',    pct: 79,  highlight: 'red' },
    { label: 'Кол-во клиентов ЮЛ, тыс.чел.', actual: '1 600',  plan: '1 869' },
    { label: 'Средний чек на 1 клиента',       actual: '12 000', plan: '15 422' },
  ],
  equity: [
    { label: 'Комиссионный доход, млн.руб.',   actual: '11 000', plan: '7 900',  pct: 139, highlight: 'green' },
    { label: 'Кол-во клиентов ФЛ, тыс.чел.',  actual: '5 100',  plan: '5 300',  pct: 96,  highlight: 'yellow' },
    { label: 'Средний чек на 1 клиента',        actual: '12 000', plan: '15 422' },
    { label: 'Кол-во активных клиентов HFT',   actual: '361 968' },
  ],
  metals: [
    { label: 'Комиссионный доход, млн.руб.',           actual: '—' },
    { label: 'Кол-во активных клиентов ФЛ, тыс.чел.', actual: '—' },
    { label: 'ADV золото спот, кг',                    actual: '—' },
  ],
  bonds: [
    { label: 'Комиссионный доход, млн.руб.',             actual: '2 340', plan: '3 100', pct: 75, highlight: 'red' },
    { label: 'Комиссионный доход ФЛ, млн.руб.',         actual: '890',   plan: '1 200' },
    { label: 'Комиссионный доход Банки, млн.руб.',      actual: '1 100', plan: '1 400' },
    { label: 'Комиссионный доход Институц., млн.руб.',  actual: '350',   plan: '500' },
    { label: 'ADV золото спот, кг',                     actual: '—' },
  ],
  pifs: [
    { label: 'Комиссионный доход, млрд.руб.',          actual: '—' },
    { label: 'Кол-во активных клиентов ФЛ, тыс.чел.', actual: '—' },
    { label: 'Средний чек на 1 клиента',               actual: '—' },
  ],
};

const FUNNEL_STAGES: Omit<FunnelStage, 'value'>[] = [
  { label: 'Переходы на профильную страницу', icon: '👁️', color: '#5b8def' },
  { label: 'Количество лидов в CRM',          icon: '✨', color: '#36c2cf' },
  { label: 'Начали оформление',               icon: '⚙️', color: '#7b6ef6' },
  { label: 'Получили допуск',                 icon: '🔥', color: '#f0883e' },
  { label: 'Первая комиссия',                 icon: '🏆', color: '#2ec27e' },
];

// Peak-month top-of-funnel (views) per market
const FUNNEL_TOP: Record<MarketKey, number> = {
  forex:  48200,
  equity: 72000,
  metals: 12000,
  bonds:  28000,
  pifs:   19000,
};

// Step-to-step conversion rates [views→leads, leads→started, started→approved, approved→converted]
const FUNNEL_CONV: Record<MarketKey, [number, number, number, number]> = {
  forex:  [0.52, 0.58, 0.62, 0.60],
  equity: [0.55, 0.62, 0.65, 0.63],
  metals: [0.48, 0.52, 0.58, 0.55],
  bonds:  [0.50, 0.56, 0.60, 0.58],
  pifs:   [0.46, 0.54, 0.59, 0.56],
};

// Seasonality multipliers Jan–Dec (applied to top-of-funnel only; downstream stages follow conv rates)
const MONTH_MULT = [0.72, 0.75, 0.85, 0.92, 0.98, 1.00, 0.95, 0.88, 0.93, 0.97, 0.82, 0.68];

function buildFunnel(top: number, conv: [number, number, number, number], mult: number): FunnelStage[] {
  const values: number[] = [Math.round(top * mult)];
  for (let i = 0; i < 4; i++) values.push(Math.round(values[i] * conv[i]));
  return FUNNEL_STAGES.map((s, i) => ({ ...s, value: values[i] }));
}

const MARKET_FUNNEL: Record<MarketKey, FunnelStage[][]> = Object.fromEntries(
  (Object.keys(FUNNEL_TOP) as MarketKey[]).map(mk => [
    mk,
    MONTH_MULT.map(mult => buildFunnel(FUNNEL_TOP[mk], FUNNEL_CONV[mk], mult)),
  ])
) as Record<MarketKey, FunnelStage[][]>;

const HL_COLORS = {
  red:    { bg: '#FFF0F2', border: '#FCCDD3', text: '#E8001C' },
  green:  { bg: '#F0FBF5', border: '#B8E8CC', text: '#12A05C' },
  yellow: { bg: '#FFFBF0', border: '#F5DDA0', text: '#F5A623' },
} as const;

function shadeDark(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}

function fmt(v: number): string {
  return v.toLocaleString('ru-RU');
}

// ─── Cohort data (per market, full-year) ─────────────────────────────────────

const MONTH_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const MONTH_FULL  = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

// maxPct = asymptotic conversion ceiling; speed = how fast cohorts ramp
const COHORT_PARAMS: Record<MarketKey, { maxPct: number; speed: number }> = {
  forex:  { maxPct: 39, speed: 0.35 },
  equity: { maxPct: 52, speed: 0.45 },
  metals: { maxPct: 28, speed: 0.25 },
  bonds:  { maxPct: 44, speed: 0.30 },
  pifs:   { maxPct: 35, speed: 0.28 },
};

function buildCohort(maxPct: number, speed: number): (number | null)[][] {
  return Array.from({ length: 12 }, (_, ri) =>
    Array.from({ length: 12 }, (_, ci) => {
      if (ci < ri) return null;
      const n = ci - ri;
      if (n === 0) return 0.0;
      return Math.round(maxPct * (1 - Math.exp(-speed * n)) * 10) / 10;
    })
  );
}

const MARKET_COHORT_FULL: Record<MarketKey, (number | null)[][]> = Object.fromEntries(
  (Object.keys(COHORT_PARAMS) as MarketKey[]).map(mk => [
    mk,
    buildCohort(COHORT_PARAMS[mk].maxPct, COHORT_PARAMS[mk].speed),
  ])
) as Record<MarketKey, (number | null)[][]>;

function cellBg(val: number, maxPct: number): string {
  const a = (0.10 + 0.88 * Math.min(val / maxPct, 1)).toFixed(3);
  return `rgba(46,194,126,${a})`;
}

// ─── Monthly sales & churn ───────────────────────────────────────────────────

interface MonthlyDatum {
  month: string;   // короткое название месяца
  closed: number;  // закрыто сделок (последняя стадия воронки)
  churn: number;   // отвал за месяц (вошло − закрыто)
  entered: number; // вошло в воронку (первая стадия)
}

function buildMonthly(market: MarketKey): MonthlyDatum[] {
  return MARKET_FUNNEL[market].map((stages, i) => {
    const entered = stages[0].value;
    const closed  = stages[stages.length - 1].value;
    return { month: MONTH_SHORT[i], closed, churn: entered - closed, entered };
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export const FunnelPage = () => {
  const [market, setMarket] = useState<MarketKey>('forex');
  const metrics = MARKET_METRICS[market];

  // Воронка и когортная матрица показывают данные за весь год.
  const funnel  = FUNNEL_STAGES.map((s, idx) => ({
    ...s,
    value: MARKET_FUNNEL[market].reduce((sum, stages) => sum + stages[idx].value, 0),
  }));
  const cohort  = MARKET_COHORT_FULL[market];
  const maxPct  = COHORT_PARAMS[market].maxPct;

  const monthly = buildMonthly(market);

  return (
    <Layout breadcrumbs={[{ label: 'Воронка продаж' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Filter size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Воронка продаж</h1>
          <p className="text-sm text-slate-500">Конверсия и привлечение клиентов по рынкам · 21.06.2026</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Market tabs ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {MARKET_TABS.map(tab => {
            const active = tab.key === market;
            return (
              <button
                key={tab.key}
                onClick={() => setMarket(tab.key)}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 700 : 600,
                  background: active ? '#E8001C' : '#fff',
                  color: active ? '#fff' : '#5A6478',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Metrics ── */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            {metrics.map((m, i) => {
              const hl = m.highlight ? HL_COLORS[m.highlight] : null;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: hl ? hl.bg : '#F6F7FA',
                    border: `1.5px solid ${hl ? hl.border : '#EDF0F4'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.4 }}>
                    {m.label}
                  </div>
                  {m.pct !== undefined ? (
                    <div style={{ fontSize: 13, fontWeight: 800, color: hl ? hl.text : '#1E2535', lineHeight: 1.2 }}>
                      {m.actual} ({m.pct}%)/{m.plan}
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#1E2535', fontVariantNumeric: 'tabular-nums' }}>
                        {m.actual}
                      </span>
                      {m.plan && (
                        <span style={{ fontSize: 12, color: '#A0AABB', marginLeft: 4 }}>/{m.plan}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Funnel + Matrix ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

          {/* Sales funnel — trapezoid band style */}
          <SalesFunnel stages={funnel} />

          {/* ── Cohort matrix ── */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', overflowX: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: '3px', width: '100%', minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 10, color: '#A0AABB', fontWeight: 600, padding: '3px 6px 3px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    Когорта \ мес.
                  </th>
                  {MONTH_SHORT.map(m => (
                    <th key={m} style={{ fontSize: 10, color: '#A0AABB', fontWeight: 600, padding: '3px 2px', textAlign: 'center' }}>
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohort.map((row, ri) => {
                  return (
                    <tr key={ri}>
                      <th style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 0',
                        textAlign: 'right', whiteSpace: 'nowrap',
                        color: '#A0AABB',
                      }}>
                        {MONTH_FULL[ri]}
                      </th>
                      {row.map((val, ci) => {
                        if (val === null) {
                          return (
                            <td key={ci} style={{
                              background: '#F6F7FA',
                              borderRadius: 6,
                              textAlign: 'center',
                              padding: '5px 2px',
                              fontSize: 10,
                              fontWeight: 700,
                              color: 'transparent',
                              minWidth: 32,
                            }}>·</td>
                          );
                        }
                        return (
                          <td
                            key={ci}
                            style={{
                              background: cellBg(val, maxPct),
                              borderRadius: 6,
                              textAlign: 'center',
                              padding: '5px 2px',
                              fontSize: 10,
                              fontWeight: 700,
                              fontVariantNumeric: 'tabular-nums',
                              color: '#04110a',
                              minWidth: 32,
                            }}
                          >
                            {val === 0 ? '0.0%' : `${val}%`}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Color scale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: '#A0AABB' }}>
            <span>0%</span>
            <div style={{ height: 8, flex: 1, maxWidth: 180, borderRadius: 6, background: 'linear-gradient(90deg, rgba(46,194,126,0.15), #2ec27e)' }} />
            <span>{maxPct}%</span>
            <span style={{ marginLeft: 'auto' }}>▪ — нет данных</span>
          </div>
        </div>

        </div>{/* ── /Funnel + Matrix grid ── */}

        {/* ── Monthly sales & churn ── */}
        <MonthlySalesChart data={monthly} />

      </div>
    </Layout>
  );
};

// ─── Monthly sales & churn chart ─────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ flex: 1, background: '#F6F7FA', border: '1.5px solid #EDF0F4', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1E2535', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#A0AABB', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MonthlySalesChart({ data }: { data: MonthlyDatum[] }) {
  const totalClosed  = data.reduce((s, d) => s + d.closed, 0);
  const totalChurn   = data.reduce((s, d) => s + d.churn, 0);
  const totalEntered = data.reduce((s, d) => s + d.entered, 0);
  const peak = data.reduce((best, d) => (d.closed > best.closed ? d : best), data[0]);
  const peakIdx = data.indexOf(peak);

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E2535' }}>Продажи и отвал по месяцам</div>
      <div style={{ fontSize: 12, color: '#A0AABB', marginTop: 2, marginBottom: 16 }}>
        Закрытые сделки (столбцы) и общий отвал из воронки за месяц (линия)
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A0AABB' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#A0AABB' }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => v.toLocaleString('ru-RU')} width={56} />
          <Tooltip
            formatter={(v: number, name) => [v.toLocaleString('ru-RU'), name]}
            contentStyle={{ borderRadius: 10, border: '1px solid #E8EBF0', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="closed" name="Закрыто сделок" radius={[6, 6, 0, 0]} maxBarSize={42}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === peakIdx ? '#2ec27e' : '#A8DEC4'} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="churn" name="Отвал за месяц" stroke="#E8001C" strokeWidth={2.5}
            dot={{ r: 3, fill: '#E8001C' }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <StatCard label="Сделок за год" value={fmt(totalClosed)} />
        <StatCard label="Пик продаж" value={`${MONTH_FULL[peakIdx]} · ${fmt(peak.closed)}`} />
        <StatCard label="Отвал за год" value={fmt(totalChurn)} />
        <StatCard label="Вошло «знают»" value={fmt(totalEntered)} />
      </div>
    </div>
  );
}

// ─── Sales Funnel ────────────────────────────────────────────────────────────

function SalesFunnel({ stages }: { stages: FunnelStage[] }) {
  const maxv = stages[0].value;

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 18 }}>
        Воронка продаж
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          const nextVal = !isLast ? stages[i + 1].value : null;
          const lost = nextVal !== null ? stage.value - nextVal : 0;
          const convRate = nextVal !== null ? Math.round((nextVal / stage.value) * 100) : 0;

          const wTop = 30 + 70 * (stage.value / maxv);
          const wBot = !isLast
            ? 30 + 70 * (stages[i + 1].value / maxv)
            : wTop * 0.82;
          const lT = (50 - wTop / 2).toFixed(2);
          const rT = (50 + wTop / 2).toFixed(2);
          const lB = (50 - wBot / 2).toFixed(2);
          const rB = (50 + wBot / 2).toFixed(2);
          const clipPath = `polygon(${lT}% 0, ${rT}% 0, ${rB}% 100%, ${lB}% 100%)`;
          const bandGrad = `linear-gradient(180deg, ${stage.color}, ${shadeDark(stage.color, -18)})`;

          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px', gap: 8, alignItems: 'stretch' }}>

              {/* Left: "дошли" + "потеряно" / "купили" */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: 6, paddingBottom: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12.5, fontWeight: 700, padding: '5px 9px', borderRadius: 9,
                  background: 'rgba(52,211,153,0.13)', color: '#2ec27e', whiteSpace: 'nowrap',
                }}>
                  <small style={{ fontWeight: 500, opacity: 0.78, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>дошли</small>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(stage.value)}</span>
                </span>
                {isLast ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12.5, fontWeight: 700, padding: '5px 9px', borderRadius: 9,
                    background: 'rgba(251,191,36,0.14)', color: '#d4920a', whiteSpace: 'nowrap',
                  }}>
                    🏆 <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(stage.value)}</span>
                    <small style={{ fontWeight: 500, opacity: 0.78, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>купили</small>
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12.5, fontWeight: 700, padding: '5px 9px', borderRadius: 9,
                    background: 'rgba(232,0,28,0.08)', color: '#E8001C', whiteSpace: 'nowrap',
                  }}>
                    ↗ <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(lost)}</span>
                    <small style={{ fontWeight: 500, opacity: 0.78, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>потеряно</small>
                  </span>
                )}
              </div>

              {/* Center: trapezoid band */}
              <div style={{ position: 'relative', minHeight: 92, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 8,
                  width: '100%', height: 84,
                  background: bandGrad,
                  clipPath,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
                  transition: 'clip-path 0.55s cubic-bezier(0.22,1,0.36,1)',
                }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 10px', pointerEvents: 'none' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.4)', color: '#fff', lineHeight: 1.3 }}>
                    {stage.icon} {stage.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, textShadow: '0 1px 6px rgba(0,0,0,0.45)', color: '#fff', marginTop: 2 }}>
                    {fmt(stage.value)}
                  </div>
                </div>
              </div>

              {/* Right: "конверсия" */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', paddingBottom: 8 }}>
                {!isLast && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 9,
                    background: '#F0F2F5', color: '#5A6478', whiteSpace: 'nowrap',
                  }}>
                    конверсия <b style={{ color: '#1E2535', fontVariantNumeric: 'tabular-nums' }}>{convRate}%</b> ↓
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
