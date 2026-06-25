import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ChevronRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ScoreBadge, StatusBadge, TrendArrow } from '../components/common';
import { holdingService } from '../services';
import { formatRevenue, formatVolume } from '../data/mockData';
import { clientGroups, type ClientGroup } from '../data/mockDatabase';
import { clientRanking, RANK_MARKETS, type RankMarketKey } from '../data/clientRanking';

// Категория холдинга → наша группа клиента (Банк / Брокер / Корпорат / Нерезидент / УК).
const CATEGORY_GROUP: Record<string, ClientGroup> = {
  BANK: 'Банк', BROKER: 'Брокер', CORPORATION: 'Корпорат', FOREIGN: 'Нерезидент',
  ASSET_MANAGER: 'УК', INSURANCE: 'Корпорат', PENSION_FUND: 'УК', STATE: 'Корпорат',
};

const SEGMENTS = ['STRATEGIC', 'PREMIUM', 'STANDARD'] as const;

export const ClientsPage = () => {
  // Общие фильтры «нашей сегментации» — действуют на обе панели.
  const [group, setGroup] = useState<string>('all');
  const [segment, setSegment] = useState<string>('all');

  return (
    <Layout breadcrumbs={[{ label: 'Клиенты' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Users size={20} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Клиенты</h1>
          <p className="text-sm text-slate-500">Холдинги в портфеле и рэнкинг по рынкам</p>
        </div>
      </div>

      <HoldingsPanel group={group} segment={segment} setGroup={setGroup} setSegment={setSegment} />
      <RankingPanel group={group} segment={segment} setGroup={setGroup} setSegment={setSegment} />
    </Layout>
  );
};

interface FilterProps {
  group: string; segment: string;
  setGroup: (v: string) => void; setSegment: (v: string) => void;
}

// Грубо-серые селекты «Группа» / «Сегмент» (наша сегментация).
const SegmentationFilters = ({ group, segment, setGroup, setSegment }: FilterProps) => {
  const cls = 'px-3 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors';
  return (
    <div className="flex items-center gap-2">
      <select value={group} onChange={e => setGroup(e.target.value)} className={cls}>
        <option value="all">Группа</option>
        {clientGroups.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <select value={segment} onChange={e => setSegment(e.target.value)} className={cls}>
        <option value="all">Сегмент</option>
        {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

/* ── Панель 1 — холдинги ──────────────────────────────────────── */
const HoldingsPanel = ({ group, segment, setGroup, setSegment }: FilterProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'health' | 'risk'>('revenue');

  const all = holdingService.getAll();
  const filtered = all
    .filter(h =>
      (search === '' || h.name.toLowerCase().includes(search.toLowerCase()) || h.shortName.toLowerCase().includes(search.toLowerCase())) &&
      (group === 'all' || CATEGORY_GROUP[h.category] === group) &&
      (segment === 'all' || h.segment === segment)
    )
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.revenueYTD - a.revenueYTD;
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      return b.riskScore - a.riskScore;
    });

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <SegmentationFilters group={group} segment={segment} setGroup={setGroup} setSegment={setSegment} />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Сортировка:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'revenue' | 'health' | 'risk')}
            className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
          >
            <option value="revenue">По доходу</option>
            <option value="health">По Health Score</option>
            <option value="risk">По Risk Score</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>#</th><th>Холдинг</th><th>Сегмент</th><th>Отрасль</th><th>Доход YTD</th>
                <th>Тренд</th><th>Оборот YTD</th><th>Health</th><th>Risk</th><th>Growth</th>
                <th>Менеджер</th><th>Статус</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={h.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/holdings/${h.id}`)}>
                  <td className="text-slate-400 font-mono text-xs w-8">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{h.shortName[0]}</div>
                      <div>
                        <div className="font-semibold text-slate-900">{h.name}</div>
                        <div className="text-xs text-slate-400">{h.companiesCount} компаний</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge-blue">{h.segment}</span></td>
                  <td className="text-sm text-slate-600">{h.industry}</td>
                  <td className="font-semibold">{formatRevenue(h.revenueYTD)}</td>
                  <td><TrendArrow current={h.revenueYTD} prev={h.revenuePrevYTD} /></td>
                  <td>{formatVolume(h.volumeYTD)}</td>
                  <td><ScoreBadge score={h.healthScore} type="health" size="sm" showLabel={false} /></td>
                  <td><ScoreBadge score={h.riskScore} type="risk" size="sm" showLabel={false} /></td>
                  <td><ScoreBadge score={h.growthPotential} type="growth" size="sm" showLabel={false} /></td>
                  <td className="text-xs text-slate-500">{h.managerName}</td>
                  <td><StatusBadge status={h.activityStatus} /></td>
                  <td><ChevronRight size={14} className="text-slate-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400">Ничего не найдено</div>}
        </div>
      </div>
    </div>
  );
};

/* ── Панель 2 — рэнкинг по рынкам ─────────────────────────────── */
const RankingPanel = ({ group, segment, setGroup, setSegment }: FilterProps) => {
  const [market, setMarket] = useState<RankMarketKey>('fx');
  const marketMeta = RANK_MARKETS.find(m => m.key === market)!;

  const rows = clientRanking
    .filter(r => (group === 'all' || r.group === group) && (segment === 'all' || r.segment === segment))
    .sort((a, b) => a.overallRank - b.overallRank);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SegmentationFilters group={group} segment={segment} setGroup={setGroup} setSegment={setSegment} />
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 mr-1">Переключение:</span>
          {RANK_MARKETS.map(m => (
            <button
              key={m.key}
              onClick={() => setMarket(m.key)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                market === m.key ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <th className="text-left px-5 py-3">Клиент</th>
                <th className="text-center px-5 py-3" colSpan={2}>{marketMeta.full}</th>
                <th className="text-center px-5 py-3" style={{ borderLeft: '2px solid #E30613' }}>Общий рэнкинг</th>
                <th className="text-center px-5 py-3">Комиссия 2026</th>
                <th className="text-center px-5 py-3">Клиенты</th>
                <th className="text-center px-5 py-3">Доля рынка</th>
                <th className="text-center px-5 py-3">Объем г/г</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const mk = r.byMarket[market];
                return (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                    {/* Клиент */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Logo name={r.name} logo={r.logo} />
                        <div>
                          <div className="font-semibold text-slate-900">{r.name}</div>
                          {r.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {r.tags.map(t => <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-green-50 text-green-700 border border-green-200">{t}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Рынок: рейтинг + объём г/г */}
                    <td className="px-5 py-4 text-center">
                      <Big color={rankColor(mk.rank)}>{mk.rank}</Big>
                      <Sub>Рейтинг</Sub>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Trend pct={mk.volYoY} />
                      <Sub>Объем г/г</Sub>
                    </td>
                    {/* Общий рэнкинг */}
                    <td className="px-5 py-4 text-center" style={{ borderLeft: '2px solid #E30613' }}>
                      <div className="flex items-center justify-center gap-2">
                        <Big color={rankColor(r.overallRank)}>{r.overallRank}</Big>
                        <DeltaPill delta={r.overallDelta} />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="font-bold text-slate-900 text-[15px]">{r.commission2026}</div>
                      <Sub>руб.</Sub>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="font-bold text-green-700 text-sm">{r.clientsActive}</div>
                      <Sub>{r.clientsTotal}</Sub>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="font-bold text-slate-900 text-sm">{r.marketShare}</div>
                      <Sub>Доля рынка</Sub>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Trend pct={r.volumeYoY} />
                      <Sub>Объем торгов</Sub>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">Нет клиентов по выбранному фильтру</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ── Мелкие элементы ──────────────────────────────────────────── */
const Big = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className="font-extrabold text-2xl leading-none" style={{ color }}>{children}</span>
);
const Sub = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] text-slate-400 mt-1">{children}</div>
);
const rankColor = (rank: number) => (rank <= 5 ? '#187A40' : rank <= 10 ? '#1C1C1C' : '#9CA3AF');

const Trend = ({ pct }: { pct: number }) => {
  const up = pct >= 0;
  return (
    <span className="font-bold text-sm" style={{ color: up ? '#187A40' : '#E30613' }}>
      {up ? '▲' : '▼'}{Math.abs(pct)}%
    </span>
  );
};

const DeltaPill = ({ delta }: { delta: number }) => {
  if (delta === 0) return null;
  const up = delta < 0; // отрицательная дельта — рост позиции
  return (
    <span
      className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
      style={up ? { background: '#E7F6EC', color: '#187A40' } : { background: '#FDE8E8', color: '#E30613' }}
    >
      {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
    </span>
  );
};

const Logo = ({ name, logo }: { name: string; logo?: string }) => {
  const [err, setErr] = useState(false);
  if (logo && !err) {
    return <img src={logo} alt={name} onError={() => setErr(true)} className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-100 flex-shrink-0" />;
  }
  return <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 text-sm font-bold flex items-center justify-center flex-shrink-0">{name.replace(/[«»"АО ПАО ООО]/g, '').trim()[0] ?? name[0]}</div>;
};
