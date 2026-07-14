import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { KPICard, ScoreBadge, SectionHeader, StatusBadge, TrendArrow, PageTitle, Card, ProgressBar } from '../components/common';
import { holdingService, newsService, opportunitiesService } from '../services';
import { formatRevenue, formatVolume } from '../data/mockData';
import { UserCheck, AlertTriangle, Target, ChevronRight, Search, Clock, Frown, TrendingDown, Package, Cake, BarChart3, Ban } from 'lucide-react';
import { heatClients, getHeatAlerts, heatAlertScore, heatDaysAgo, heatFmt } from '../data/heatmap';

const MANAGER_ID = 'mgr1';

// Flat (lucide) icons for the Тепловая карта alert codes — replaces emoji.
const HEAT_ALERT_ICON: Record<string, typeof AlertTriangle> = {
  inactive: Clock,
  detractor: Frown,
  nps_drop: TrendingDown,
  single_product: Package,
  birthday: Cake,
  underplan: BarChart3,
};

export const ManagerPage = () => {
  const navigate = useNavigate();
  const holdings = holdingService.getByManager(MANAGER_ID);
  const news = newsService.getRecent(3);
  const opportunities = opportunitiesService.getAll().filter(o => o.assigneeId === MANAGER_ID);

  const totalRevenue = holdings.reduce((s, h) => s + h.revenueYTD, 0);
  const totalPrevRevenue = holdings.reduce((s, h) => s + h.revenuePrevYTD, 0);
  const totalVolume = holdings.reduce((s, h) => s + h.volumeYTD, 0);

  // Annual KPI
  const ANN_REVENUE_PLAN = 4_800_000_000;
  const ANN_HEALTH_TARGET = 80;
  const ANN_PRODUCTS_TARGET = 3.5;
  const ANN_NEW_PLAN = 3;
  const ANN_NEW_YTD = 1;
  const PACE_PCT = Math.round((166 / 365) * 100); // ~45% through year

  const activeHoldings = holdings.filter(h => h.activityStatus === 'active').length;
  const avgHealth = Math.round(holdings.reduce((s, h) => s + h.healthScore, 0) / (holdings.length || 1));
  const avgProducts = holdings.reduce((s, h) => s + h.productsCount, 0) / (holdings.length || 1);

  // status against pace/target → reuses the site's on_track / at_risk / behind StatusBadge + ProgressBar colors
  const kpiState = (pct: number, ok: number, warn: number) =>
    pct >= ok ? { status: 'on_track', color: 'green' } : pct >= warn ? { status: 'at_risk', color: 'amber' } : { status: 'behind', color: 'red' };

  const annualKpis = [
    (() => {
      const pct = (totalRevenue / ANN_REVENUE_PLAN) * 100;
      const st = kpiState(pct, PACE_PCT, PACE_PCT * 0.85);
      return { label: 'Доход YTD', value: formatRevenue(totalRevenue), sub: `План: ${formatRevenue(ANN_REVENUE_PLAN)} · ${Math.round(pct)}%`, barValue: pct, ...st };
    })(),
    (() => {
      const pct = (activeHoldings / holdings.length) * 100;
      const st = kpiState(pct, 80, 60);
      return { label: 'Активные холдинги', value: `${activeHoldings} / ${holdings.length}`, sub: 'Среднемесячно активных', barValue: pct, ...st };
    })(),
    (() => {
      const st = kpiState(avgHealth, ANN_HEALTH_TARGET, ANN_HEALTH_TARGET * 0.85);
      return { label: 'Health Score портфеля', value: String(avgHealth), sub: `Целевое: ≥ ${ANN_HEALTH_TARGET}`, barValue: avgHealth, ...st };
    })(),
    (() => {
      const pct = (avgProducts / ANN_PRODUCTS_TARGET) * 100;
      const st = kpiState(pct, 100, 80);
      return { label: 'Продуктов на холдинг', value: avgProducts.toFixed(1), sub: `Цель: ≥ ${ANN_PRODUCTS_TARGET}`, barValue: (avgProducts / 6) * 100, ...st };
    })(),
    (() => {
      const pct = (ANN_NEW_YTD / ANN_NEW_PLAN) * 100;
      const st = kpiState(pct, PACE_PCT, PACE_PCT * 0.8);
      return { label: 'Новые холдинги YTD', value: `${ANN_NEW_YTD} / ${ANN_NEW_PLAN}`, sub: `Год. план: ${ANN_NEW_PLAN}`, barValue: pct, ...st };
    })(),
  ];

  // ── Тепловая карта (heatmap) ────────────────────────────────
  const HEAT_PAGE_SIZE = 6;
  const [heatSearch, setHeatSearch] = useState('');
  const [heatSeg, setHeatSeg] = useState('');
  const [heatAlert, setHeatAlert] = useState('');
  const [heatSort, setHeatSort] = useState('alerts');
  const [heatPage, setHeatPage] = useState(1);

  const totalHeatComm = heatClients.reduce((s, c) => s + c.commMTD, 0);
  const maxHeatShare = Math.max(...heatClients.map(c => (c.commMTD / totalHeatComm) * 100));

  const heatFiltered = useMemo(() => {
    const data = heatClients.filter(c => {
      if (heatSearch && !c.name.toLowerCase().includes(heatSearch.toLowerCase())) return false;
      if (heatSeg && c.seg !== heatSeg) return false;
      if (heatAlert) {
        const as = getHeatAlerts(c);
        if (heatAlert === 'single_product' && c.products.length !== 1) return false;
        if (heatAlert !== 'single_product' && !as.some(a => a.code === heatAlert)) return false;
      }
      return true;
    });
    return [...data].sort((a, b) => {
      switch (heatSort) {
        case 'name': return a.name.localeCompare(b.name, 'ru');
        case 'aum': return b.aum - a.aum;
        case 'comm': return b.commMTD - a.commMTD;
        case 'inactive': return heatDaysAgo(b.lastTrade) - heatDaysAgo(a.lastTrade);
        case 'nps': return a.nps - b.nps;
        default: return heatAlertScore(b) - heatAlertScore(a);
      }
    });
  }, [heatSearch, heatSeg, heatAlert, heatSort]);

  const heatPages = Math.max(1, Math.ceil(heatFiltered.length / HEAT_PAGE_SIZE));
  const heatPageClamped = Math.min(heatPage, heatPages);
  const heatRows = heatFiltered.slice((heatPageClamped - 1) * HEAT_PAGE_SIZE, heatPageClamped * HEAT_PAGE_SIZE);

  return (
    <Layout breadcrumbs={[{ label: 'Клиентский менеджер' }]}>
      <PageTitle
        icon={<UserCheck size={22} />}
        accent="#12A05C"
        title="Мой клиентский портфель"
      />

      {/* Annual KPI */}
      <Card padding={20} style={{ marginBottom: 16 }}>
        <SectionHeader title="Годовой KPI" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {annualKpis.map(k => (
            <div key={k.label} style={{ display: 'flex', flexDirection: 'column', padding: 16, borderRadius: 14, border: '1.5px solid #E8EBF0', background: '#FBFCFD' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10, minHeight: 28 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.7, lineHeight: 1.3 }}>{k.label}</span>
                <StatusBadge status={k.status} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1E2535', fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: '#A0AABB', margin: '3px 0 10px' }}>{k.sub}</div>
              <div style={{ marginTop: 'auto' }}>
                <ProgressBar value={k.barValue} color={k.color} />
              </div>
            </div>
          ))}
        </div>
        {/* Portfolio totals — second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <KPICard label="Доход портфеля YTD" value={formatRevenue(totalRevenue)} change={{ current: totalRevenue, prev: totalPrevRevenue }} icon={<Target size={16} />} accent="blue" />
          <KPICard label="Оборот портфеля YTD" value={formatVolume(totalVolume)} icon={<Target size={16} />} accent="violet" />
        </div>
      </Card>

      {/* Тепловая карта */}
      <div className="card overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="section-title">Тепловая карта</h2>
            <p className="text-xs text-slate-500 mt-0.5">{heatFiltered.length} из {heatClients.length} клиентов</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-moex-muted" />
              <input
                value={heatSearch}
                onChange={e => { setHeatSearch(e.target.value); setHeatPage(1); }}
                placeholder="Поиск по названию..."
                className="input w-64"
                style={{ paddingLeft: 34 }}
              />
            </div>
            <select value={heatSeg} onChange={e => { setHeatSeg(e.target.value); setHeatPage(1); }} className="input">
              <option value="">Все сегменты</option>
              <option value="Банк">Банки</option>
              <option value="Корпорат">Корпораты</option>
              <option value="Брокер">Брокеры</option>
            </select>
            <select value={heatAlert} onChange={e => { setHeatAlert(e.target.value); setHeatPage(1); }} className="input">
              <option value="">Все клиенты</option>
              <option value="inactive">Неактивные 20+ дней</option>
              <option value="detractor">NPS Детракторы</option>
              <option value="single_product">1 продукт</option>
              <option value="birthday">День рождения ЛПР</option>
              <option value="underplan">Недовыполнение плана</option>
            </select>
            <select value={heatSort} onChange={e => { setHeatSort(e.target.value); setHeatPage(1); }} className="input">
              <option value="alerts">По приоритету алертов</option>
              <option value="name">По названию</option>
              <option value="aum">Оборот ↓</option>
              <option value="comm">Комиссия MTD ↓</option>
              <option value="inactive">Давность активности ↓</option>
              <option value="nps">NPS ↑</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Клиент</th><th>Оборот</th><th>Комиссия MTD</th>
                <th>Доля в доходе</th><th>Последняя сделка</th><th>NPS</th><th>Продукты</th>
                <th>Алерты</th><th>Следующее действие</th>
              </tr>
            </thead>
            <tbody>
              {heatRows.length === 0 ? (
                <tr><td colSpan={12} className="text-center text-slate-400 py-8">Нет клиентов по заданным фильтрам</td></tr>
              ) : heatRows.map(c => {
                const alerts = getHeatAlerts(c);
                const d = heatDaysAgo(c.lastTrade);
                const share = ((c.commMTD / totalHeatComm) * 100);
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td>
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="badge-gray">{c.seg}</span>
                        {c.restrictions?.map(r => (
                          <span key={r} className="badge-red whitespace-nowrap inline-flex items-center gap-1"><Ban size={11} /> {r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="font-semibold whitespace-nowrap">{heatFmt(c.aum)}</td>
                    <td className="whitespace-nowrap">{heatFmt(c.commMTD)}</td>
                    <td>
                      <div className="text-xs font-bold text-slate-700 mb-1">{share.toFixed(1)}%</div>
                      <div style={{ width: 70 }}><ProgressBar value={share} max={maxHeatShare} color="blue" /></div>
                    </td>
                    <td>
                      <div className="text-xs whitespace-nowrap">{c.lastTrade}</div>
                      <div className={`text-[11px] ${d >= 30 ? 'text-red-600' : d >= 20 ? 'text-amber-600' : 'text-slate-400'}`}>{d === 0 ? 'сегодня' : `${d} дн. назад`}</div>
                    </td>
                    <td><TrendArrow current={c.nps} prev={c.npsPrev} /></td>
                    <td>
                      <div className="text-[11px] text-slate-400 mb-1">{c.products.length} прод.</div>
                      <div className="flex flex-wrap gap-1" style={{ maxWidth: 150 }}>
                        {c.products.map(p => <span key={p} className="tag">{p}</span>)}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap" style={{ maxWidth: 90 }}>
                        {alerts.length ? alerts.map((a, i) => {
                          const Icon = HEAT_ALERT_ICON[a.code] ?? AlertTriangle;
                          const tone = a.type === 'danger' ? 'bg-red-50 text-red-600' : a.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600';
                          return (
                            <span key={i} title={a.label} className={`inline-flex items-center justify-center w-5 h-5 rounded-md cursor-default ${tone}`}>
                              <Icon size={12} />
                            </span>
                          );
                        }) : <span className="text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="text-slate-500" style={{ minWidth: 180 }}>{c.action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pager */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-slate-500">
            {heatFiltered.length === 0 ? '0' : `${(heatPageClamped - 1) * HEAT_PAGE_SIZE + 1}–${Math.min(heatPageClamped * HEAT_PAGE_SIZE, heatFiltered.length)}`} из {heatFiltered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              className="px-3 py-1.5 text-xs font-bold rounded-xl border-[1.5px] border-slate-200 text-slate-600 bg-white hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 transition-colors"
              disabled={heatPageClamped <= 1}
              onClick={() => setHeatPage(p => Math.max(1, p - 1))}
            >← Назад</button>
            {Array.from({ length: heatPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setHeatPage(p)}
                className={`w-8 h-8 text-xs font-bold rounded-xl border-[1.5px] transition-colors ${p === heatPageClamped ? 'bg-moex-red text-white border-moex-red' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-100 hover:border-slate-300'}`}
              >{p}</button>
            ))}
            <button
              className="px-3 py-1.5 text-xs font-bold rounded-xl border-[1.5px] border-slate-200 text-slate-600 bg-white hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 transition-colors"
              disabled={heatPageClamped >= heatPages}
              onClick={() => setHeatPage(p => Math.min(heatPages, p + 1))}
            >Вперёд →</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: portfolio */}
        <div className="lg:col-span-2 space-y-4">

          {/* Holdings portfolio */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="section-title">Мои холдинги</h2>
                <p className="text-xs text-slate-500 mt-0.5">{holdings.length} холдингов</p>
              </div>
              <button className="btn-secondary text-xs" onClick={() => navigate('/holdings')}>
                Все <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Холдинг</th><th>Доход YTD</th><th>Тренд</th>
                  <th>Health</th><th>Risk</th><th>Growth</th><th>Статус</th><th></th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => (
                  <tr key={h.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/holdings/${h.id}`)}>
                    <td>
                      <div className="font-semibold text-slate-900">{h.shortName}</div>
                      <div className="text-xs text-slate-400">{h.managerName !== 'Алексей Воронов' ? h.managerName : h.industry}</div>
                    </td>
                    <td className="font-semibold">{formatRevenue(h.revenueYTD)}</td>
                    <td><TrendArrow current={h.revenueYTD} prev={h.revenuePrevYTD} /></td>
                    <td><ScoreBadge score={h.healthScore} type="health" size="sm" showLabel={false} /></td>
                    <td><ScoreBadge score={h.riskScore} type="risk" size="sm" showLabel={false} /></td>
                    <td><ScoreBadge score={h.growthPotential} type="growth" size="sm" showLabel={false} /></td>
                    <td><StatusBadge status={h.activityStatus} /></td>
                    <td><ChevronRight size={14} className="text-slate-300" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

        </div>

        {/* RIGHT: opportunities, news */}
        <div className="space-y-4">
          {/* Opportunities */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-green-600" />
              <h3 className="text-sm font-semibold text-slate-900">Потенциал роста</h3>
            </div>
            {opportunities.slice(0, 3).map(o => (
              <div key={o.id} className="p-2.5 rounded-lg bg-green-50 border border-green-100 mb-2">
                <div className="text-xs font-semibold text-slate-900">{o.entityName}</div>
                <div className="text-xs text-slate-600">{o.description.slice(0, 60)}...</div>
                <div className="text-xs text-green-700 font-semibold mt-1">+{formatRevenue(o.potentialRevenue)}</div>
              </div>
            ))}
          </div>

          {/* News */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Бизнес-сигналы</h3>
              <button className="text-xs text-blue-600" onClick={() => navigate('/news')}>Все →</button>
            </div>
            {news.map(n => (
              <div key={n.id} className={`p-2.5 rounded-lg border mb-2 ${n.sentiment === 'negative' ? 'bg-red-50 border-red-100' : n.sentiment === 'positive' ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{n.source} · {n.date}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
};
