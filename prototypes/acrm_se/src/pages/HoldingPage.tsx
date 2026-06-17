import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Layout } from '../components/layout/Layout';
import { KPICard, ScoreBadge, StatusBadge, AlertItem, AIInsightCard, SectionHeader, TrendArrow } from '../components/common';
import {
  holdingService, companyService, personService, alertsService,
  tasksService, aiInsightsService, revenueService, strategyService, newsService,
} from '../services';
import { formatRevenue, formatVolume } from '../data/mockData';
import {
  Building2, Users, AlertTriangle, TrendingUp, Target, Brain,
  ChevronRight, FileText, MapPin, Calendar,
} from 'lucide-react';
import { mockHoldings } from '../data/mockData';

const TAB_IDS = ['overview', 'companies', 'revenue', 'products', 'persons', 'alerts', 'tasks', 'strategy', 'news'] as const;
type TabId = typeof TAB_IDS[number];
const TAB_LABELS: Record<TabId, string> = {
  overview: 'Обзор', companies: 'Компании', revenue: 'Доходы',
  products: 'Продукты', persons: 'Контакты', alerts: 'Алерты',
  tasks: 'Задачи', strategy: 'Стратегия', news: 'Новости',
};

export const HoldingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('overview');

  const holding = holdingService.getById(id || 'h1') || mockHoldings[0];
  const companies = companyService.getByHolding(holding.id);
  const persons = personService.getByHolding(holding.id);
  const alerts = alertsService.getByEntity(holding.id);
  const tasks = tasksService.getByEntity(holding.id);
  const insights = aiInsightsService.getByEntity(holding.id);
  const revenue = revenueService.getByHolding(holding.id);
  const strategy = strategyService.getByEntity(holding.id);
  const news = newsService.getByEntity(holding.id);

  const segmentColor: Record<string, string> = {
    STRATEGIC: 'badge-purple',
    PREMIUM: 'badge-blue',
    STANDARD: 'badge-gray',
  };

  return (
    <Layout breadcrumbs={[
      { label: 'Холдинги', path: '/holdings' },
      { label: holding.name },
    ]}>
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
            {holding.shortName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{holding.name}</h1>
              <span className={segmentColor[holding.segment] || 'badge-gray'}>{holding.segment}</span>
              <StatusBadge status={holding.activityStatus} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Building2 size={12} />{holding.industry}</span>
              <span className="flex items-center gap-1"><Users size={12} />{holding.managerName}</span>
              <span>Рейтинг: <strong className="text-slate-900">#{holding.groupRank}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ScoreBadge score={holding.healthScore} type="health" />
            <ScoreBadge score={holding.riskScore} type="risk" />
            <ScoreBadge score={holding.growthPotential} type="growth" />
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-100">
          {[
            { label: 'Доход YTD', value: formatRevenue(holding.revenueYTD), change: { current: holding.revenueYTD, prev: holding.revenuePrevYTD } },
            { label: 'Оборот YTD', value: formatVolume(holding.volumeYTD) },
            { label: 'Компаний', value: `${holding.activeCompaniesCount} / ${holding.companiesCount}`, sub: 'Активных' },
            { label: 'Продуктов', value: String(holding.productsCount) },
            { label: 'Рынков', value: String(holding.marketsCount) },
            { label: 'Открытых задач', value: String(tasks.length + alerts.length) },
          ].map((k, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-slate-500 mb-0.5">{k.label}</div>
              <div className="text-base font-bold text-slate-900">{k.value}</div>
              {k.sub && <div className="text-xs text-slate-400">{k.sub}</div>}
              {k.change && <TrendArrow current={k.change.current} prev={k.change.prev} />}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { label: 'AI-сводка', icon: <Brain size={14} />, accent: 'btn-primary' },
          { label: 'Запланировать встречу', icon: <Calendar size={14} />, accent: 'btn-secondary' },
          { label: 'Создать задачу', icon: <Target size={14} />, accent: 'btn-secondary' },
          { label: 'Сформировать brief', icon: <FileText size={14} />, accent: 'btn-secondary' },
          { label: 'Стратегия', icon: <TrendingUp size={14} />, accent: 'btn-secondary', path: '/strategy' },
        ].map(a => (
          <button key={a.label} className={a.accent}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-5 flex overflow-x-auto">
        {TAB_IDS.map(t => (
          <button key={t} className={`tab-button ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* AI Insights */}
            {insights.length > 0 && (
              <div className="space-y-3">
                {insights.map(ins => (
                  <AIInsightCard key={ins.id} title={ins.title} body={ins.body} confidence={ins.confidence} type={ins.type} />
                ))}
              </div>
            )}
            {insights.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">AI-сводка по холдингу</span>
                </div>
                <p className="text-xs text-blue-800">
                  {holding.name} — {holding.segment} клиент в отрасли «{holding.industry}».
                  Доход YTD: {formatRevenue(holding.revenueYTD)}.
                  Статус: {holding.activityStatus === 'active' ? 'Активен, положительная динамика' : 'Снижение активности — требует внимания'}.
                  Рекомендую проверить последние алерты и задачи.
                </p>
              </div>
            )}

            {/* Revenue chart */}
            <div className="card p-5">
              <SectionHeader title="Динамика дохода и оборота" />
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `${(v / 1e9).toFixed(1)}млрд`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => formatRevenue(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line dataKey="revenue" stroke="#2196F3" strokeWidth={2} name="Доход 2026" dot={false} />
                  <Line dataKey="prevRevenue" stroke="#CBD5E1" strokeWidth={2} name="Доход 2025" dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Org tree */}
            <div className="card p-5">
              <SectionHeader title="Структура холдинга" subtitle="Организационное дерево — кликабельно" />
              <div className="pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="font-semibold text-slate-900">{holding.name}</span>
                  <span className="badge-purple text-xs">{holding.segment}</span>
                </div>
                {companies.length > 0 ? (
                  <div className="pl-6 border-l-2 border-slate-200 space-y-2">
                    {companies.map(c => (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 cursor-pointer group"
                        onClick={() => navigate(`/companies/${c.id}`)}
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700">{c.name}</span>
                        <span className="text-xs text-slate-400">ИНН: {c.inn}</span>
                        <StatusBadge status={c.clientStatus} />
                        <ChevronRight size={12} className="text-slate-300 ml-auto group-hover:text-blue-400" />
                      </div>
                    ))}
                    {/* Mock additional companies */}
                    {companies.length === 0 && (
                      <div className="text-xs text-slate-400 italic">Нет связанных компаний в текущем периоде</div>
                    )}
                  </div>
                ) : (
                  <div className="pl-6 border-l-2 border-slate-200">
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-sm font-medium text-slate-900">{holding.shortName} (головная компания)</span>
                      <StatusBadge status="active" />
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 cursor-pointer pl-6">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <span className="text-sm text-slate-600">{holding.shortName} Капитал</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 cursor-pointer pl-6">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <span className="text-sm text-slate-600">{holding.shortName} Инвестиции</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Alerts */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Алерты</h3>
                <button className="text-xs text-blue-600" onClick={() => setTab('alerts')}>Все →</button>
              </div>
              {alerts.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">Нет активных алертов</div>
              ) : alerts.slice(0, 3).map(a => (
                <AlertItem key={a.id} title={a.title} description={a.description.slice(0, 80) + '...'} severity={a.severity} date={a.date} />
              ))}
            </div>

            {/* Tasks */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Задачи</h3>
                <button className="text-xs text-blue-600" onClick={() => setTab('tasks')}>Все →</button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">Нет задач</div>
              ) : tasks.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border-b border-slate-50 last:border-0">
                  <StatusBadge status={t.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 truncate">{t.title}</div>
                    <div className="text-xs text-slate-400">{t.dueDate}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contacts */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Ключевые контакты</h3>
                <button className="text-xs text-blue-600" onClick={() => setTab('persons')}>Все →</button>
              </div>
              {(persons.length > 0 ? persons : []).slice(0, 3).map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate(`/persons/${p.id}`)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{p.fullName}</div>
                    <div className="text-xs text-slate-500 truncate">{p.title}</div>
                  </div>
                  <ChevronRight size={12} className="text-slate-300" />
                </div>
              ))}
              {persons.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-2">Нет данных о контактах</div>
              )}
            </div>

            {/* Strategy preview */}
            {strategy.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Стратегия</h3>
                {strategy.map(s => (
                  <div key={s.id} className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{s.marketLabel}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${s.status === 'on_track' ? 'bg-green-500' : s.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.progress}%</div>
                  </div>
                ))}
                <button className="text-xs text-blue-600 hover:text-blue-800" onClick={() => setTab('strategy')}>
                  Полная стратегия →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'companies' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Компания</th><th>ИНН</th><th>Сегмент</th><th>Доход YTD</th>
                <th>Тренд</th><th>Health</th><th>Risk</th><th>Статус</th><th></th>
              </tr>
            </thead>
            <tbody>
              {companies.length > 0 ? companies.map(c => (
                <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/companies/${c.id}`)}>
                  <td>
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.industry}</div>
                  </td>
                  <td className="font-mono text-xs text-slate-500">{c.inn}</td>
                  <td><span className="badge-blue">{c.segment}</span></td>
                  <td className="font-semibold">{formatRevenue(c.revenueYTD)}</td>
                  <td><TrendArrow current={c.revenueYTD} prev={c.revenuePrevYTD} /></td>
                  <td><ScoreBadge score={c.healthScore} type="health" size="sm" showLabel={false} /></td>
                  <td><ScoreBadge score={c.riskScore} type="risk" size="sm" showLabel={false} /></td>
                  <td><StatusBadge status={c.clientStatus} /></td>
                  <td><ChevronRight size={14} className="text-slate-300" /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Компании в этом холдинге не связаны с текущим пользователем
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'revenue' && (
        <div>
          <div className="card p-4">
            <SectionHeader title="Динамика доходов и оборотов" />
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 1e9).toFixed(1)}млрд`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatRevenue(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="revenue" stroke="#2196F3" strokeWidth={2} name="Доход 2026" dot={false} />
                <Line dataKey="prevRevenue" stroke="#CBD5E1" strokeWidth={2} name="Доход 2025" dot={false} strokeDasharray="4 4" />
                <Line dataKey="volume" stroke="#9B59B6" strokeWidth={2} name="Оборот 2026" dot={false} yAxisId="right" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="section-title">Задачи по холдингу</h2>
            <button className="btn-primary text-xs"><Target size={14} /> Создать задачу</button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr><th>Задача</th><th>Тип</th><th>Приоритет</th><th>Исполнитель</th><th>Срок</th><th>Статус</th></tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? tasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="font-medium text-slate-900">{t.title}</td>
                  <td><span className="badge-gray">{t.type}</span></td>
                  <td><span className={`text-xs font-medium px-1.5 py-0.5 rounded ${t.priority === 'critical' ? 'bg-red-100 text-red-700' : t.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{t.priority}</span></td>
                  <td className="text-slate-500 text-xs">{t.assigneeName}</td>
                  <td className="text-slate-500 text-xs">{t.dueDate}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Нет задач</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length > 0 ? alerts.map(a => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    a.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    a.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{a.severity.toUpperCase()}</span>
                  <h3 className="text-sm font-semibold text-slate-900">{a.title}</h3>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-sm text-slate-600 mt-2">{a.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span>Источник: {a.source}</span>
                <span>Дата: {a.date}</span>
                <span>Ответственный: {a.responsibleName}</span>
              </div>
              <div className="mt-3 p-2.5 bg-blue-50 rounded-lg text-xs text-blue-800">
                <span className="font-semibold">Рекомендуемое действие:</span> {a.recommendedAction}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn-primary text-xs">Взять в работу</button>
                <button className="btn-secondary text-xs">Передать</button>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="text-slate-400 text-sm">Нет активных алертов для этого холдинга</div>
            </div>
          )}
        </div>
      )}

      {tab === 'strategy' && (
        <div className="space-y-4">
          {strategy.length > 0 ? (
            <>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Рынок</th><th>Оборот факт</th><th>Оборот цель</th>
                      <th>Доход факт</th><th>Доход цель</th><th>Gap</th>
                      <th>Инициатива</th><th>Владелец</th><th>Статус</th><th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategy.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="font-semibold">{s.marketLabel}</td>
                        <td>{formatVolume(s.currentVolume)}</td>
                        <td>{formatVolume(s.targetVolume)}</td>
                        <td>{formatRevenue(s.revenueActual)}</td>
                        <td>{formatRevenue(s.revenueTarget)}</td>
                        <td className={s.gap < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                          {s.gap > 0 ? '+' : ''}{formatRevenue(s.gap)}
                        </td>
                        <td className="text-xs">{s.initiative}</td>
                        <td className="text-xs text-slate-500">{s.owner}</td>
                        <td><StatusBadge status={s.status} /></td>
                        <td>
                          <div className="flex items-center gap-1">
                            <div className="w-12 bg-slate-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${s.status === 'on_track' ? 'bg-green-500' : s.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.progress}%` }} />
                            </div>
                            <span className="text-xs text-slate-600">{s.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="text-slate-400 text-sm">Стратегические цели для этого холдинга не заданы</div>
            </div>
          )}
        </div>
      )}

      {tab === 'news' && (
        <div className="space-y-3">
          {news.length > 0 ? news.map(n => (
            <div key={n.id} className={`bg-white rounded-xl border p-4 shadow-sm ${n.sentiment === 'negative' ? 'border-red-200' : n.sentiment === 'positive' ? 'border-green-200' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${n.sentiment === 'negative' ? 'bg-red-100 text-red-700' : n.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {n.sentiment === 'negative' ? 'Негативный сигнал' : n.sentiment === 'positive' ? 'Позитивный сигнал' : 'Нейтрально'}
                </span>
                <span className="text-xs text-slate-400">{n.source} · {n.date}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{n.title}</h3>
              <p className="text-xs text-slate-600">{n.summary}</p>
            </div>
          )) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="text-slate-400 text-sm">Нет релевантных новостей</div>
            </div>
          )}
        </div>
      )}

      {tab === 'persons' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {persons.length > 0 ? persons.map(p => (
            <div
              key={p.id}
              className="card p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
              onClick={() => navigate(`/persons/${p.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{p.fullName}</div>
                  <div className="text-xs text-slate-500">{p.title}</div>
                  <div className="text-xs text-slate-400">{p.companyName}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-blue text-xs">{p.personRole}</span>
                    <span className="text-xs text-slate-400">VIP: {p.vipScore}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 mt-1" />
              </div>
            </div>
          )) : (
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="text-slate-400 text-sm">Нет контактов для этого холдинга</div>
            </div>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Продукты и сервисы</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Фондовый рынок', 'Срочный рынок', 'Валютный рынок', 'Денежный рынок', 'Товарный рынок', 'Клиринг', 'Депозитарий', 'Инфо-сервисы', 'Тех. сервисы'].map((prod, i) => (
              <div key={prod} className={`p-3 rounded-lg border ${i < 5 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-sm font-semibold text-slate-900">{prod}</div>
                <div className={`text-xs mt-1 font-medium ${i < 5 ? 'text-green-600' : 'text-slate-400'}`}>
                  {i < 5 ? '✓ Подключён и активен' : '○ Не подключён'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};
