import { useMemo, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { activityMonitorService } from '../services';
import { clientGroups, clearingCategories } from '../data/mockDatabase';
import { Activity, Plus, AlertTriangle, Clock, Frown, TrendingDown, Package, Cake, BarChart3 } from 'lucide-react';

// Иконки алертов — те же коды, что в «Тепловой карте» (Manager).
const CLIENT_ALERT_ICON: Record<string, typeof AlertTriangle> = {
  inactive: Clock,
  detractor: Frown,
  nps_drop: TrendingDown,
  single_product: Package,
  birthday: Cake,
  underplan: BarChart3,
};

// Цветовая палитра статусов продукта (значения из требований)
const PRODUCT_STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  'Активно торгует': { bg: 'rgba(18,160,92,0.12)', fg: '#0F8A4E' },
  'Подключен к бою': { bg: 'rgba(18,160,92,0.08)', fg: '#12A05C' },
  'Подключен': { bg: '#EBF4FC', fg: '#1565C0' },
  'Перспективный': { bg: 'rgba(155,89,182,0.10)', fg: '#7A3B93' },
  'Низкая активность': { bg: '#FEF3E2', fg: '#B07800' },
  'Не торгует': { bg: '#FDE7EA', fg: '#E8001C' },
  'Нет интереса': { bg: '#FDE7EA', fg: '#C0334A' },
  'Нет статуса': { bg: '#F0F2F5', fg: '#5A6478' },
};

const initials = (name: string) =>
  name.replace(/[«»"]/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');

const ClientAvatar = ({ name, logo }: { name: string; logo?: string }) => (
  <div style={{
    width: 36, height: 36, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#F0F2F5', border: '1px solid #E8EBF0',
    fontSize: 12, fontWeight: 700, color: '#5A6478',
  }}>
    {logo
      ? <img src={logo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      : initials(name)}
  </div>
);

const GROUPS = clientGroups;
const CATEGORIES = clearingCategories;

const fmtTurnover = (v?: number) => {
  if (v == null) return '—';
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1).replace('.', ',')} млрд ₽`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} млн ₽`;
  return v.toLocaleString('ru-RU') + ' ₽';
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const ActivityMonitorPage = () => {
  const markets = activityMonitorService.getMarkets();
  const all = activityMonitorService.getClients();

  const [group, setGroup] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [restrictions, setRestrictions] = useState<string>('all');
  const [market, setMarket] = useState<string>('all');

  // Колонки продуктов сгруппированы по рынкам. «Рынок: все» → все рынки,
  // иначе только выбранный. Каждая колонка — конкретный продукт рынка.
  const selectedMarket = markets.find(m => m.id === market);
  const visibleMarkets = selectedMarket ? [selectedMarket] : markets;
  const productCount = visibleMarkets.reduce((s, m) => s + m.products.length, 0);
  const tableMinWidth = 900 + productCount * 120;

  const displayed = useMemo(() => all.filter(c =>
    (group === 'all' || c.group === group) &&
    (category === 'all' || c.clearingCategory === category) &&
    (restrictions === 'all' || c.restrictions === restrictions)
  ), [all, group, category, restrictions]);

  return (
    <Layout breadcrumbs={[{ label: 'Монитор активности' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Activity size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Монитор активности</h1>
          <p className="text-sm text-slate-500">Активность клиентов по продуктам · 21.06.2026</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        <button className="btn-primary text-sm"><Plus size={15} /> Создать типовую задачу</button>
        <span className="text-sm font-medium text-slate-700 ml-2">Клиенты</span>
        <span className="text-xs text-slate-400">· {displayed.length}</span>
        <div className="ml-auto flex items-center gap-3">
          <select value={market} onChange={e => setMarket(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red">
            <option value="all">Рынок: все</option>
            {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={group} onChange={e => setGroup(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red">
            <option value="all">Группа: все</option>
            {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red">
            <option value="all">Категория: все</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={restrictions} onChange={e => setRestrictions(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red">
            <option value="all">Ограничения: все</option>
            <option value="да">да</option>
            <option value="нет">нет</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full data-table" style={{ minWidth: tableMinWidth }}>
          <thead>
            <tr>
              <th style={{ minWidth: 260 }}>Клиент</th>
              <th>Посл. активность</th>
              <th>Сегмент</th>
              <th>Оборот</th>
              <th>Алерты</th>
              {visibleMarkets.flatMap(m => m.products.map((p, pi) => (
                <th key={`${m.id}-${pi}`} className="whitespace-nowrap">{p}</th>
              )))}
              <th>Задача</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td style={{ minWidth: 260 }}>
                  <div className="flex items-center gap-2.5">
                    <ClientAvatar name={c.name} logo={c.logo} />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{c.name}</div>
                      {(c.group || c.clearingCategory || c.restrictions === 'да') && (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {c.group && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{c.group}</span>}
                          {c.clearingCategory && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Клиринг: {c.clearingCategory}</span>
                          )}
                          {c.restrictions === 'да' && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700">Санкции</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-xs text-slate-600 whitespace-nowrap">{fmtDate(c.lastActivity)}</td>
                <td className="text-xs text-slate-600">{c.segment ?? '—'}</td>
                <td className="text-sm text-slate-800 whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTurnover(c.turnover)}</td>
                <td>
                  <div className="flex gap-1 flex-wrap" style={{ maxWidth: 90 }}>
                    {c.alertList && c.alertList.length ? c.alertList.map((a, i) => {
                      const Icon = CLIENT_ALERT_ICON[a.code] ?? AlertTriangle;
                      const tone = a.type === 'danger' ? 'bg-red-50 text-red-600' : a.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600';
                      return (
                        <span key={i} title={a.label} className={`inline-flex items-center justify-center w-5 h-5 rounded-md cursor-default ${tone}`}>
                          <Icon size={12} />
                        </span>
                      );
                    }) : <span className="text-slate-300">—</span>}
                  </div>
                </td>
                {visibleMarkets.flatMap(m => m.products.map((_, pi) => {
                  const st = c.marketStatuses?.[m.id]?.[pi];
                  const s = st ? (PRODUCT_STATUS_STYLE[st] ?? { bg: '#F0F2F5', fg: '#5A6478' }) : null;
                  return (
                    <td key={`${m.id}-${pi}`} style={{ padding: 4 }}>
                      {st && s && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          height: '100%', minHeight: 48, padding: '4px 8px', borderRadius: 8, textAlign: 'center',
                          fontSize: 11, fontWeight: 700, lineHeight: 1.2,
                          background: s.bg, color: s.fg,
                        }}>
                          {st}
                        </div>
                      )}
                    </td>
                  );
                }))}
                <td>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-moex-red hover:underline">
                    <Plus size={13} /> создать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <div className="text-center py-12 text-slate-400">Нет клиентов по выбранному фильтру</div>
        )}
      </div>
    </Layout>
  );
};
