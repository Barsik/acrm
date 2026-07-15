import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Layout } from '../components/layout/Layout';
import { KPICard, AIInsightCard, SectionHeader, StatusBadge, ScoreBadge, TrendArrow, PageTitle } from '../components/common';
import { productService, holdingService, alertsService, aiInsightsService, opportunitiesService } from '../services';
import { clientPathFor } from '../data/entityToClient';
import { formatRevenue, formatVolume } from '../data/mockData';
import { BarChart2, Target, AlertTriangle, Zap, Users, Plus, Filter, Brain, ChevronRight } from 'lucide-react';

const PIE_COLORS = ['#4A90D9', '#9B59B6', '#0D7377', '#F5A623', '#E8001C'];

export const MarketLeadPage = () => {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState('all');
  const markets = productService.getMarketMetrics();
  const holdings = holdingService.getAll();
  const alerts = alertsService.getCritical();
  const insights = aiInsightsService.getAll();
  const opps = opportunitiesService.getTopOpportunities(5);

  const funnelData = [
    { stage: 'Всего клиентов', count: 1240 },
    { stage: 'Активных', count: 980 },
    { stage: 'Используют продукт', count: 642 },
    { stage: 'С потенциалом роста', count: 214 },
    { stage: 'В кампании', count: 87 },
  ];

  const segmentData = [
    { name: 'STRATEGIC', value: 12 },
    { name: 'PREMIUM', value: 48 },
    { name: 'STANDARD', value: 280 },
    { name: 'SME', value: 640 },
    { name: 'RETAIL', value: 260 },
  ];

  return (
    <Layout breadcrumbs={[{ label: 'Рынки / PM / CX' }]}>
      <PageTitle
        icon={<BarChart2 size={22} />}
        accent="#4A90D9"
        title="Рабочее пространство рынка"
        subtitle="PM / CX · 09.06.2026"
        actions={<>
          <div style={{ display: 'flex', gap: 4 }}>
            {([['all', 'Все'], ['equity', 'Фонд.'], ['derivatives', 'Сроч.'], ['fx', 'Вал.'], ['money', 'Ден.']] as const).map(([m, label]) => (
              <button
                key={m}
                onClick={() => setSelectedMarket(m)}
                style={{
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  padding: '6px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
                  background: selectedMarket === m ? '#1E2535' : '#F0F2F5',
                  color: selectedMarket === m ? '#fff' : '#5A6478',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="btn-primary"><Zap size={15} /> Кампания</button>
        </>}
      />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPICard label="Активных клиентов" value="980" sub="из 1 240 всего" icon={<Users size={16} />} accent="blue" />
        <KPICard label="С потенциалом кросс-продаж" value="214" icon={<Target size={16} />} accent="green" onClick={() => navigate('/cohorts')} />
        <KPICard label="Неиспользуемые продукты" value="67" sub="подключены, не активны" icon={<AlertTriangle size={16} />} accent="amber" />
        <KPICard label="Открытых кампаний" value="3" sub="87 клиентов в воронке" icon={<Zap size={16} />} accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Funnel */}
          <div className="card p-5">
            <SectionHeader title="Воронка клиентов по продукту" subtitle="Этапы активации" />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2196F3" radius={[0, 4, 4, 0]} name="Клиентов" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Market metrics table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <SectionHeader title="Активность по рынкам" subtitle="YTD метрики" />
            </div>
            <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Рынок</th><th>Клиентов</th><th>Оборот YTD</th><th>Доход YTD</th><th>Тренд</th>
                </tr>
              </thead>
              <tbody>
                {markets.map(m => (
                  <tr key={m.market} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate('/products')}>
                    <td className="font-semibold text-slate-900">{m.marketLabel}</td>
                    <td>{m.clientsCount}</td>
                    <td>{formatVolume(m.volumeYTD)}</td>
                    <td>{formatRevenue(m.revenueYTD)}</td>
                    <td>
                      <span className={`text-xs font-semibold ${m.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {m.trend >= 0 ? '+' : ''}{m.trend}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Clients with growth potential */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="section-title">Клиенты с потенциалом</h2>
                <p className="text-xs text-slate-500 mt-0.5">Не подключены, но есть потенциал</p>
              </div>
              <button className="btn-secondary text-xs"><Filter size={14} /> Выборка</button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr><th>Клиент</th><th>Продукт</th><th>Потенциал</th><th>Вер-ть</th><th>Менеджер</th><th></th></tr>
              </thead>
              <tbody>
                {opps.map(o => (
                  <tr key={o.id} className="cursor-pointer" onClick={() => navigate(`/holdings/${o.entityId}`)}>
                    <td className="font-semibold text-slate-900">{o.entityName}</td>
                    <td>{o.product}</td>
                    <td className="text-green-700 font-semibold">+{formatRevenue(o.potentialRevenue)}</td>
                    <td><span className="badge-blue">{o.probability}%</span></td>
                    <td className="text-slate-500 text-xs">{o.assigneeId}</td>
                    <td>
                      <button className="text-xs text-blue-600 hover:text-blue-800">→</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Segment Pie */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Сегменты клиентов</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={segmentData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {segmentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insights */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-violet-600" />
              <h3 className="text-sm font-semibold text-slate-900">AI-инсайты по рынку</h3>
            </div>
            <AIInsightCard title={insights[3]?.title || 'Cross-sell возможности'} body={insights[3]?.body || '...'} confidence={insights[3]?.confidence || 79} type={insights[3]?.type || 'cross_sell'} />
          </div>

          {/* Alerts */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Продуктовые алерты</h3>
              <button className="text-xs text-blue-600" onClick={() => navigate('/alerts')}>Все →</button>
            </div>
            {alerts.slice(0, 3).map(a => (
              <div
                key={a.id}
                className="p-2.5 rounded-lg border border-slate-100 mb-2 hover:bg-slate-50 cursor-pointer"
                onClick={() => { const p = clientPathFor(a.entityId, a.entityName); if (p) navigate(p); }}
              >
                <div className="text-xs font-semibold text-slate-900">{a.entityName}</div>
                <div className="text-xs text-slate-500 mt-0.5">{a.title}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Действия</h3>
            <div className="space-y-2">
              {[
                { label: 'Посмотреть Cross-sell клиентов', path: '/cohorts' },
                { label: 'Падение активности', path: '/alerts' },
                { label: 'Провалиться в клиента', path: '/holdings' },
                { label: 'Создать задачу менеджеру', path: '/tasks' },
              ].map(a => (
                <button key={a.label} className="btn-secondary w-full justify-start text-xs" onClick={() => navigate(a.path)}>
                  <ChevronRight size={14} /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
