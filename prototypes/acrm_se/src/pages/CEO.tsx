import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, BarChart as ReBarChart,
} from 'recharts';
import { Layout } from '../components/layout/Layout';
import { KPICard, ScoreBadge, SeverityBadge, AIInsightCard, TrendArrow, SectionHeader, StatusBadge, PageTitle } from '../components/common';
import {
  holdingService, revenueService, productService, aiInsightsService,
  alertsService, opportunitiesService,
} from '../services';
import { clientPathFor } from '../data/entityToClient';
import { formatRevenue, formatVolume, formatPercent } from '../data/mockData';
import { Brain, TrendingUp, AlertTriangle, Target, FileText, Users, ChevronRight, Crown, BarChart2 } from 'lucide-react';

const MARKET_COLORS = ['#4A90D9', '#9B59B6', '#0D7377', '#F5A623', '#E8001C', '#12A05C'];

export const CEOPage = () => {
  const navigate = useNavigate();
  const [activeQuery, setActiveQuery] = useState<string | null>(null);

  const holdings = holdingService.getTopByRevenue(20);
  const atRisk = holdingService.getAtRisk();
  const revenue = revenueService.getMonthly();
  const markets = productService.getMarketMetrics();
  const insights = aiInsightsService.getAll();
  const alerts = alertsService.getCritical();
  const opportunities = opportunitiesService.getTopOpportunities(5);

  const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
  const totalVolume = revenue.reduce((s, r) => s + r.volume, 0);
  const prevRevenue = revenue.reduce((s, r) => s + r.prevRevenue, 0);

  const ceoPredefinedQueries = [
    'Клиенты с падением оборотов более 20%',
    'Топ-клиенты по потенциалу роста',
    'Холдинги с высоким риском потери дохода',
    'Рынки с недополученным доходом',
    'Стратегические клиенты без контакта 60+ дней',
  ];

  const queryResults: Record<string, string> = {
    'Клиенты с падением оборотов более 20%': 'Найдено 2 клиента: ВТБ Капитал (−22%), Россельхозбанк (−28%). Суммарный риск доходов: −241 млн ₽.',
    'Топ-клиенты по потенциалу роста': 'Топ-3: Сбер Инвестиции (Growth 87), Альфа-Банк (Growth 76), Газпром Финанс (Growth 71).',
    'Холдинги с высоким риском потери дохода': '2 холдинга: ВТБ Группа (Risk 38), Россельхозбанк (Risk 62). Рекомендую срочные встречи.',
    'Рынки с недополученным доходом': 'Срочный рынок: −14% YTD. Товарный рынок: крупные клиенты без подключения (потенциал +200 млн).',
    'Стратегические клиенты без контакта 60+ дней': '1 клиент: Россельхозбанк — последний контакт 30 апреля (40 дней назад).',
  };

  return (
    <Layout breadcrumbs={[{ label: 'CEO / Правление' }]}>
      <PageTitle
        icon={<Crown size={22} />}
        accent="#9B59B6"
        title="Портфель клиентского бизнеса"
        subtitle="Московская Биржа · CEO · 09.06.2026"
        actions={<>
          <button className="btn-primary" onClick={() => navigate('/strategy')}><Brain size={15} /> AI-сводка</button>
          <button className="btn-secondary" onClick={() => navigate('/revenue')}><FileText size={15} /> Отчёт</button>
        </>}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Доход Группы YTD"
          value={formatRevenue(totalRevenue)}
          change={{ current: totalRevenue, prev: prevRevenue }}
          icon={<TrendingUp size={16} />}
          accent="blue"
        />
        <KPICard
          label="Оборот Группы YTD"
          value={formatVolume(totalVolume)}
          icon={<BarChart2 size={16} />}
          accent="violet"
        />
        <KPICard
          label="Клиенты в риске"
          value={String(atRisk.length)}
          sub="Требуют внимания"
          icon={<AlertTriangle size={16} />}
          accent="red"
          onClick={() => navigate('/alerts')}
        />
        <KPICard
          label="Возможности роста"
          value={formatRevenue(opportunities.reduce((s, o) => s + o.potentialRevenue, 0))}
          sub={`${opportunities.length} инициатив`}
          icon={<Target size={16} />}
          accent="green"
          onClick={() => navigate('/cohorts')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Revenue Chart */}
          <div className="card p-5">
            <SectionHeader
              title="Динамика доходов по Группе"
              subtitle="YTD vs предыдущий год, млн ₽"
              actions={
                <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
                  <option>2026</option><option>2025</option>
                </select>
              }
            />
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 1e9).toFixed(1)}млрд`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatRevenue(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="revenue" stroke="#2196F3" strokeWidth={2} name="2026" dot={false} />
                <Line dataKey="prevRevenue" stroke="#CBD5E1" strokeWidth={2} name="2025" dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Market Metrics */}
          <div className="card p-5">
            <SectionHeader title="Доходы по рынкам" subtitle="YTD, млн ₽" />
            <ResponsiveContainer width="100%" height={200}>
              <ReBarChart data={markets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tickFormatter={v => `${(v / 1e9).toFixed(1)}млрд`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="marketLabel" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatRevenue(Number(v))} />
                <Bar dataKey="revenueYTD" name="Доход YTD" radius={[0, 4, 4, 0]}>
                  {markets.map((_, idx) => (
                    <Cell key={idx} fill={MARKET_COLORS[idx % MARKET_COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Holdings Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="section-title">Топ-20 холдингов</h2>
                <p className="text-xs text-slate-500 mt-0.5">По доходу YTD</p>
              </div>
              <button className="btn-secondary text-xs" onClick={() => navigate('/holdings')}>
                Все <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>#</th><th>Холдинг</th><th>Сегмент</th>
                  <th>Доход YTD</th><th>Тренд</th>
                  <th>Health</th><th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 8).map((h, i) => (
                  <tr
                    key={h.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/holdings/${h.id}`)}
                  >
                    <td className="text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td>
                      <div className="font-semibold text-slate-900">{h.shortName}</div>
                      <div className="text-xs text-slate-400">{h.industry}</div>
                    </td>
                    <td><span className="badge-blue">{h.segment}</span></td>
                    <td className="font-semibold">{formatRevenue(h.revenueYTD)}</td>
                    <td><TrendArrow current={h.revenueYTD} prev={h.revenuePrevYTD} /></td>
                    <td><ScoreBadge score={h.healthScore} type="health" size="sm" showLabel={false} /></td>
                    <td><ScoreBadge score={h.riskScore} type="risk" size="sm" showLabel={false} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* RIGHT: AI + Alerts + Actions */}
        <div className="space-y-4">
          {/* AI Queries */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-violet-600" />
              <h3 className="text-sm font-semibold text-slate-900">AI-запросы CEO</h3>
            </div>
            <div className="space-y-1.5">
              {ceoPredefinedQueries.map((q, i) => (
                <button
                  key={i}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                    activeQuery === q
                      ? 'bg-violet-50 border-violet-200 text-violet-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200'
                  }`}
                  onClick={() => setActiveQuery(activeQuery === q ? null : q)}
                >
                  {q}
                </button>
              ))}
            </div>
            {activeQuery && queryResults[activeQuery] && (
              <div className="mt-3 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                <div className="text-xs font-semibold text-violet-600 mb-1">Результат AI-запроса</div>
                <p className="text-xs text-violet-900 leading-relaxed">{queryResults[activeQuery]}</p>
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">AI-инсайты по портфелю</h3>
            <div className="space-y-3">
              {insights.slice(0, 2).map(ins => (
                <AIInsightCard key={ins.id} title={ins.title} body={ins.body} confidence={ins.confidence} type={ins.type} />
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Критичные алерты</h3>
              <button className="text-xs text-blue-600 hover:text-blue-800" onClick={() => navigate('/alerts')}>
                Все →
              </button>
            </div>
            {alerts.slice(0, 3).map(a => (
              <div
                key={a.id}
                className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-100 mb-2 hover:bg-slate-50 cursor-pointer"
                onClick={() => { const p = clientPathFor(a.entityId, a.entityName); if (p) navigate(p); }}
              >
                <SeverityBadge severity={a.severity} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900">{a.entityName}</div>
                  <div className="text-xs text-slate-500 truncate">{a.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Growth Opportunities */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Возможности роста</h3>
              <button className="text-xs text-green-600 hover:text-green-800">Все →</button>
            </div>
            {opportunities.slice(0, 3).map(o => (
              <div
                key={o.id}
                className="p-2.5 rounded-lg bg-green-50 border border-green-100 mb-2 cursor-pointer hover:border-green-300"
                onClick={() => { const p = clientPathFor(o.entityId, o.entityName); if (p) navigate(p); }}
              >
                <div className="text-xs font-semibold text-slate-900">{o.entityName}</div>
                <div className="text-xs text-slate-600">{o.product}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-green-700 font-semibold">+{formatRevenue(o.potentialRevenue)}</span>
                  <span className="text-xs text-slate-400">{o.probability}% вер.</span>
                </div>
              </div>
            ))}
          </div>

          {/* CEO Actions */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Управленческие действия</h3>
            <div className="space-y-2">
              {[
                { label: 'Рейтинг клиентов', path: '/holdings', icon: <Users size={14} /> },
                { label: 'Риски портфеля', path: '/alerts', icon: <AlertTriangle size={14} /> },
                { label: 'Возможности роста', path: '/cohorts', icon: <Target size={14} /> },
                { label: 'Стратегия', path: '/strategy', icon: <TrendingUp size={14} /> },
              ].map((action) => (
                <button
                  key={action.path}
                  className="btn-secondary w-full justify-start text-xs"
                  onClick={() => navigate(action.path)}
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
