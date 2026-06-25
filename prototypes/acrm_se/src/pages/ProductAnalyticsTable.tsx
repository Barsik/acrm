import { useMemo, useState } from 'react';
import { activityMonitorService } from '../services';
import { markets, type ProductStatus, type Market } from '../data/mockDatabase';
import { MONTHS_SHORT, YEAR_SPLIT, YTD_MONTHS, fmtMoney, fmtMln } from '../data/markets';

type ToVal = number | 'ytd';
type SortCol = 'name' | 'clients' | 'pen' | 'turnover' | 'comm' | 'potential';

interface Props {
  /** market.id или 'all' — приходит из фильтра карточки сверху. */
  marketId: string;
  /** имя продукта или 'all'. */
  product: string;
  /** группа клиента или 'all'. */
  group: string;
  /** сегмент клиента или 'all'. */
  segment: string;
}

// Статусы, означающие, что клиент пользуется продуктом.
const ACTIVE: ProductStatus[] = ['Активно торгует', 'Подключен', 'Подключен к бою', 'Низкая активность'];
// Условная ставка комиссии от оборота (для прототипа).
const COMMISSION_RATE = 0.0008;

const MARKET_COLOR: Record<string, string> = {
  equity: '#2B63B8', derivatives: '#187A40', fx: '#C85A08', money: '#6B35C8', commodity: '#0E7490',
};

const monthLabel = (i: number) => `${MONTHS_SHORT[i]} ${i < YEAR_SPLIT ? '2025' : '2026'}`;
const uses = (statuses: ProductStatus[] | undefined, idx: number) =>
  statuses ? ACTIVE.includes(statuses[idx]) : false;

interface AnalyticsRow {
  name: string;
  market: Market;
  color: string;
  clients: number;
  total: number;
  pen: number;
  turnover: number;
  comm: number;
  potential: number;
}

// Самостоятельный блок «Аналитика по продуктам» — данные из монитора активности,
// фильтруются теми же фильтрами, что и круговая диаграмма наверху страницы.
export const ProductAnalyticsTable = ({ marketId, product, group, segment }: Props) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState<ToVal>('ytd');
  const [sort, setSort] = useState<{ col: SortCol; asc: boolean }>({ col: 'clients', asc: false });

  const isYTD = to === 'ytd';
  const commLabel = isYTD ? 'Комиссия YTD' : 'Доход за период';
  const months = isYTD ? YTD_MONTHS : (to as number) - from + 1;
  const factor = months / 12;

  const allClients = activityMonitorService.getClients();

  const rows = useMemo<AnalyticsRow[]>(() => {
    // Фильтрация клиентов группой и сегментом (как у диаграммы).
    const filtered = allClients.filter(c =>
      (group === 'all' || c.group === group) &&
      (segment === 'all' || c.segment === segment),
    );
    const total = filtered.length;

    // Сколько продуктов клиент реально использует во всех рынках — для разнесения оборота.
    const activeCount = (mStatuses?: Record<string, ProductStatus[]>) =>
      markets.reduce((s, m) => s + m.products.reduce((n, _p, i) => n + (uses(mStatuses?.[m.id], i) ? 1 : 0), 0), 0);

    // Набор продуктов в области видимости из фильтров рынка/продукта.
    const scope: { market: Market; idx: number; name: string }[] = [];
    const targetMarkets = marketId === 'all' ? markets : markets.filter(m => m.id === marketId);
    targetMarkets.forEach(m => m.products.forEach((name, idx) => {
      if (product === 'all' || product === name) scope.push({ market: m, idx, name });
    }));

    const built = scope.map(({ market, idx, name }) => {
      const withProd = filtered.filter(c => uses(c.marketStatuses?.[market.id], idx));
      const turnover = withProd.reduce((s, c) => {
        const cnt = Math.max(1, activeCount(c.marketStatuses));
        return s + (c.turnover ?? 0) / cnt;
      }, 0) * factor;
      return {
        name,
        market,
        color: MARKET_COLOR[market.id] ?? '#ccc',
        clients: withProd.length,
        total,
        pen: total ? (withProd.length / total) * 100 : 0,
        turnover,
        comm: turnover * COMMISSION_RATE,
        potential: total - withProd.length,
      };
    });

    const dir = sort.asc ? 1 : -1;
    return built.sort((a, b) => {
      if (sort.col === 'name') return a.name.localeCompare(b.name, 'ru') * dir;
      const d = (a[sort.col] as number) - (b[sort.col] as number);
      return (d || a.name.localeCompare(b.name, 'ru')) * dir;
    });
  }, [allClients, marketId, product, group, segment, factor, sort]);

  const maxComm = Math.max(...rows.map(r => r.comm), 1);
  const toggleSort = (col: SortCol) =>
    setSort(s => (s.col === col ? { col, asc: !s.asc } : { col, asc: false }));
  const subtitle = isYTD ? 'Факт YTD' : `${monthLabel(from)} — ${monthLabel(to as number)}`;

  return (
    <div className="card overflow-hidden mt-6">
      {/* Заголовок + период */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-slate-900">Аналитика по продуктам</h2>
          <span className="text-[11px] text-slate-500">Фильтры синхронизированы с диаграммой выше</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-slate-500">{subtitle}</span>
          <RangeSelect from={from} to={to} setFrom={setFrom} setTo={setTo} />
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="atable">
          <thead>
            <tr>
              <SortTh sort={sort} col="name" onClick={toggleSort} left>Продукт</SortTh>
              <SortTh sort={sort} col="clients" onClick={toggleSort}>Клиентов</SortTh>
              <SortTh sort={sort} col="pen" onClick={toggleSort}>Проникновение</SortTh>
              <SortTh sort={sort} col="turnover" onClick={toggleSort}>Оборот</SortTh>
              <SortTh sort={sort} col="comm" onClick={toggleSort}>{commLabel}</SortTh>
              <SortTh sort={sort} col="potential" onClick={toggleSort}>Потенциал (кросс-продажи)</SortTh>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="atd text-slate-400" colSpan={6} style={{ textAlign: 'center', padding: 24 }}>Нет продуктов по выбранному фильтру</td></tr>
            ) : rows.map(r => <Row key={`${r.market.id}-${r.name}`} r={r} maxComm={maxComm} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Row = ({ r, maxComm }: { r: AnalyticsRow; maxComm: number }) => {
  const penColor = r.pen >= 70 ? '#187A40' : r.pen >= 40 ? '#C85A08' : '#E30613';
  return (
    <tr>
      <td className="atd" style={{ fontWeight: 700, borderLeft: `3px solid ${r.color}`, paddingLeft: 12, textAlign: 'left' }}>
        {r.name}
        <div style={{ fontSize: 9, color: r.color, fontWeight: 600, marginTop: 1 }}>{r.market.name}</div>
      </td>
      <td className="atd" style={{ textAlign: 'center' }}>
        <span style={{ fontWeight: 700 }}>{r.clients}</span>
        <span style={{ color: '#717171', fontSize: 10 }}> из {r.total}</span>
      </td>
      <td className="atd" style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 12 }}>{r.pen.toFixed(1)}%</div>
        <Bar pct={r.pen} color={penColor} />
      </td>
      <td className="atd" style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>{fmtMoney(r.turnover)}</td>
      <td className="atd" style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 12 }}>{fmtMln(r.comm)}</div>
        <Bar pct={(r.comm / maxComm) * 100} color="#2B63B8" />
      </td>
      <td className="atd" style={{ textAlign: 'center' }}>
        <span style={{ fontWeight: 700, color: r.potential > 15 ? '#187A40' : '#717171' }}>{r.potential}</span>
        <span style={{ fontSize: 10, color: '#717171' }}> клиентов</span>
      </td>
    </tr>
  );
};

const Bar = ({ pct, color }: { pct: number; color: string }) => (
  <div style={{ height: 4, width: 80, background: '#E6E6E6', borderRadius: 2, overflow: 'hidden', margin: '3px auto 0' }}>
    <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, background: color, borderRadius: 2 }} />
  </div>
);

const SortTh = ({ sort, col, onClick, children, left }: {
  sort: { col: SortCol; asc: boolean }; col: SortCol; onClick: (c: SortCol) => void;
  children: React.ReactNode; left?: boolean;
}) => (
  <th
    className="ath"
    onClick={() => onClick(col)}
    style={{ textAlign: left ? 'left' : 'center', paddingLeft: left ? 16 : undefined, cursor: 'pointer' }}
  >
    {children}
    <span style={{ color: '#ADADAD' }}>{sort.col === col ? (sort.asc ? ' ↑' : ' ↓') : ''}</span>
  </th>
);

const RangeSelect = ({ from, to, setFrom, setTo }: {
  from: number; to: ToVal; setFrom: (v: number) => void; setTo: (v: ToVal) => void;
}) => {
  const opts = MONTHS_SHORT.map((m, i) => ({ value: i, label: monthLabel(i) }));
  const cls = 'text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red';
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] font-bold text-slate-500">С</span>
      <select value={from} className={cls}
        onChange={e => { const v = +e.target.value; setFrom(v); if (to !== 'ytd' && to < v) setTo(v); }}>
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="text-[11px] font-bold text-slate-500">По</span>
      <select value={String(to)} className={cls}
        onChange={e => setTo(e.target.value === 'ytd' ? 'ytd' : Math.max(from, +e.target.value))}>
        <option value="ytd">YTD</option>
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
};
