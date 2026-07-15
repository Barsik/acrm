import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { StatusBadge, TaskStatusBadge, AlertStatusBadge, AlertItem, AIInsightCard, SectionHeader } from '../components/common';
import {
  alertsService, personService, tasksService,
  aiInsightsService, productService,
} from '../services';
import { clients as clientRecords } from '../data/mockDatabase';
import { clientIdForEntity } from '../data/entityToClient';
import { CompanyRankingTab } from '../features/ranking/CompanyRankingTab';
import { TaskViewModal } from '../features/tasks/TaskViewModal';
import { CreateTaskModal } from '../features/tasks/CreateTaskModal';
import { AlertViewModal, alertTypeLabels, severityLabels } from '../features/alerts/AlertViewModal';
import { AISummaryModal } from '../features/clients/AISummaryModal';
import { BriefModal } from '../features/clients/BriefModal';
import { useApp } from '../context/AppContext';
import type { Task, Alert } from '../types';

// Справочники и форматы — как в разделе «Задачи»
const taskTypeLabels: Record<string, string> = {
  call: 'Звонок', meeting: 'Встреча', document: 'Документ',
  escalation: 'Эскалация', cross_sell: 'Cross-sell', other: 'Прочее',
};
const taskPriorityLabels: Record<string, string> = {
  critical: 'Критично', high: 'Высокий', medium: 'Средний', low: 'Низкий',
};
const taskPriorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
};
// '2026-06-09' → '09-06-2026'
const formatDueDate = (date: string) => date.split('-').reverse().join('-');

const alertSeverityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
};
import { PortfolioAnalyticsTab } from '../features/portfolioAnalytics/PortfolioAnalyticsTab';
import { formatRevenue, formatVolume } from '../data/mockData';
import { ChevronRight, Brain, Target, FileText, AlertTriangle, Plus } from 'lucide-react';

const TABS = ['products', 'operations', 'revenue', 'holding', 'end_clients', 'contacts', 'alerts', 'tasks', 'ratings', 'market_comparison', 'documents'] as const;
type TabId = typeof TABS[number];
const TAB_LABELS: Record<TabId, string> = {
  products: 'Продукты и сервисы', operations: 'Операции',
  revenue: 'Доходы', holding: 'Холдинг', end_clients: 'Конечные клиенты', contacts: 'Контакты',
  alerts: 'Алерты', tasks: 'Задачи', ratings: 'Рейтинги', market_comparison: 'Аналитика портфеля', documents: 'Документы',
};

export const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useApp();
  const [tab, setTab] = useState<TabId>('products');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Обработка задачи — как в разделе «Задачи»: открытие новой переводит её в работу
  const openTask = (task: Task) => {
    if (task.status === 'open') tasksService.update(task.id, { status: 'in_progress' });
    setSelectedTask(task);
  };

  // Обработка алерта — как в разделе «Алерты»
  const openAlert = (alert: Alert) => {
    if (alert.status === 'new') alertsService.update(alert.id, { status: 'in_progress' });
    setSelectedAlert(alert);
  };

  // Закрытие меню действий по клику вне его
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const client = clientRecords.find((item) => item.id === Number(id));
  const persons = personService.getByCompany(String(client?.id ?? ''));
  // Алерты привязаны к холдингам/компаниям mockData — берём их через сопоставление с клиентом
  const alerts = alertsService.getAll().filter(a =>
    a.entityId && (clientIdForEntity(a.entityId) === client?.id || a.entityId === String(client?.id)),
  );
  // Задачи привязаны к холдингам/компаниям mockData (через сопоставление)
  // или напрямую к клиенту (задачи, созданные через форму)
  const tasks = tasksService.getAll().filter(t =>
    t.entityId && (clientIdForEntity(t.entityId) === client?.id || t.entityId === String(client?.id)),
  );
  const insights = aiInsightsService.getByEntity(String(client?.id ?? ''));
  const products = productService.getByCompany(String(client?.id ?? ''));
  const healthScore = client?.id % 3 === 0 ? 72 : 68;
  const primaryStatus = client?.status === 'Активный' ? 'Активен' : 'Неактивен';

  if (!client) {
    return (
      <Layout breadcrumbs={[{ label: 'Клиенты', path: '/clients' }, { label: 'Клиент не найден' }]}>
        <div className="card p-6">
          <div className="text-sm text-slate-500">Клиент не найден</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbs={[{ label: 'Клиенты', path: '/clients' }, { label: client.name }]}> 
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
            {client.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
              <StatusBadge status={client.status === 'Активный' ? 'active' : 'inactive'} />
              <StatusBadge status={client.alertList?.length ? 'declining' : 'on_track'} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span>ИНН: <strong className="text-slate-700 font-mono">{client.inn}</strong></span>
              <span>ОГРН: <strong className="text-slate-700 font-mono">—</strong></span>
              <span>Менеджер: <strong className="text-slate-700">{client.manager}</strong></span>
              <span>Отрасль: {client.segment ?? '—'}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">Клиент</span>
            <div ref={actionsRef} className="relative">
              <button
                title="Действия"
                onClick={() => setActionsOpen(o => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <Plus size={18} className={`transition-transform ${actionsOpen ? 'rotate-45' : ''}`} />
              </button>
              {actionsOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-30 flex w-60 flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <button className="btn-primary w-full text-sm" onClick={() => { setActionsOpen(false); setAiSummaryOpen(true); }}>
                    <Brain size={14} /> AI-сводка
                  </button>
                  <button className="btn-secondary w-full text-sm" onClick={() => { setActionsOpen(false); setCreateTaskOpen(true); }}>
                    <Target size={14} /> Создать задачу
                  </button>
                  <button className="btn-secondary w-full text-sm" onClick={() => { setActionsOpen(false); setBriefOpen(true); }}>
                    <FileText size={14} /> Brief к встрече
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-100">
          {[
            { label: 'Доход YTD', value: formatRevenue(client.turnover ?? 0) },
            { label: 'Оборот YTD', value: formatVolume(client.turnover ?? 0) },
            { label: 'Активных продуктов', value: '3' },
            { label: 'Рынков', value: '3' },
            { label: 'Конечных клиентов', value: '72 000' },
            { label: 'Открытых запросов', value: '7' },
          ].map((k, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-slate-400 mb-0.5">{k.label}</div>
              <div className="text-base font-bold text-slate-900">{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-slate-200 mb-5 flex overflow-x-auto">
        {TABS.map(t => (
          <button key={t} className={`tab-button ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'contacts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {persons.map(p => (
            <div
              key={p.id}
              className="card p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
              onClick={() => navigate(`/persons/${p.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{p.fullName}</div>
                  <div className="text-xs text-slate-500">{p.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{p.email} · {p.phone}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-purple text-xs">{p.personRole}</span>
                    <span className="badge-blue text-xs">{p.influenceLevel}</span>
                    <span className="text-xs text-slate-400">VIP: {p.vipScore}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {persons.length === 0 && (
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="text-slate-400">Нет контактов</div>
            </div>
          )}
        </div>
      )}

      {tab === 'end_clients' && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={14} className="text-amber-500" />
            <p className="text-xs text-amber-800">
              Персональные данные конечных клиентов отображаются только при наличии соответствующих прав доступа.
              Агрегированные данные по сегментам доступны всем авторизованным пользователям.
            </p>
          </div>
          <SectionHeader title="Конечные клиенты" subtitle={`Всего: 72 000 клиентов`} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { seg: 'Квалифицированные инвесторы', count: 25200, assets: '₽ 2.1 трлн' },
              { seg: 'Физические лица (розница)', count: 39600, assets: '₽ 820 млрд' },
              { seg: 'Юридические лица', count: 7200, assets: '₽ 480 млрд' },
            ].map(s => (
              <div key={s.seg} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-sm font-semibold text-slate-900">{s.seg}</div>
                <div className="text-2xl font-bold text-blue-700 mt-2">{s.count.toLocaleString('ru')}</div>
                <div className="text-xs text-slate-500 mt-1">Активы: {s.assets}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="section-title">Алерты</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Алерт</th><th>Дата</th>
                  {role !== 'manager' && <th>Ответственный</th>}<th>Важность</th><th>Тип</th><th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openAlert(a)}>
                    <td>
                      <div className="text-sm font-medium text-slate-900">{a.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{a.description}</div>
                    </td>
                    <td className="text-xs font-medium text-slate-600">{formatDueDate(a.date)}</td>
                    {role !== 'manager' && (
                      <td className="text-xs text-slate-600">{a.responsibleName}</td>
                    )}
                    <td>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${alertSeverityColor[a.severity]}`}>
                        {severityLabels[a.severity]}
                      </span>
                    </td>
                    <td><span className="badge-gray text-xs">{alertTypeLabels[a.type] ?? a.type}</span></td>
                    <td><AlertStatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {alerts.length === 0 && <tr><td colSpan={role !== 'manager' ? 6 : 5} className="text-center py-8 text-slate-400">Нет алертов</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="section-title">Задачи</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Задача</th><th>Срок</th>
                  {role !== 'manager' && <th>Ответственный</th>}<th>Приоритет</th><th>Тип</th><th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openTask(t)}>
                    <td>
                      <div className="text-sm font-medium text-slate-900">{t.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{t.description}</div>
                    </td>
                    <td className={`text-xs font-medium ${new Date(t.dueDate + 'T00:00:00') < new Date('2026-06-09T00:00:00') && t.status !== 'done' ? 'text-red-600' : 'text-slate-600'}`}>
                      {formatDueDate(t.dueDate)}
                    </td>
                    {role !== 'manager' && (
                      <td className="text-xs text-slate-600">{t.assigneeName}</td>
                    )}
                    <td>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${taskPriorityColor[t.priority]}`}>
                        {taskPriorityLabels[t.priority]}
                      </span>
                    </td>
                    <td><span className="badge-gray text-xs">{taskTypeLabels[t.type]}</span></td>
                    <td><TaskStatusBadge status={t.status} /></td>
                  </tr>
                ))}
                {tasks.length === 0 && <tr><td colSpan={role !== 'manager' ? 6 : 5} className="text-center py-8 text-slate-400">Нет задач</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ratings' && <CompanyRankingTab companyName={client.name} />}

      {tab === 'market_comparison' && <PortfolioAnalyticsTab companyName={client.name} />}

      {(tab === 'products' || tab === 'operations' || tab === 'revenue' || tab === 'holding' || tab === 'documents') && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="text-slate-400 text-sm">Раздел «{TAB_LABELS[tab]}»</div>
          <p className="text-xs text-slate-300 mt-2">В полной версии здесь будут детализированные данные из ЕХД, биллинга и торговой системы</p>
        </div>
      )}

      <TaskViewModal
        key={selectedTask?.id ?? 'none'}
        task={selectedTask}
        onCancel={() => setSelectedTask(null)}
        onComplete={result => {
          if (selectedTask) {
            tasksService.update(selectedTask.id, { status: 'done', result, completedAt: '2026-06-09' });
          }
          setSelectedTask(null);
        }}
      />

      <AISummaryModal
        open={aiSummaryOpen}
        client={client}
        onClose={() => setAiSummaryOpen(false)}
      />

      <CreateTaskModal
        open={createTaskOpen}
        defaultClient={client}
        onClose={() => setCreateTaskOpen(false)}
        onCreate={task => tasksService.create(task)}
      />

      <BriefModal
        open={briefOpen}
        client={client}
        alerts={alerts}
        tasks={tasks}
        persons={persons}
        products={products}
        onClose={() => setBriefOpen(false)}
      />

      <AlertViewModal
        key={`alert-${selectedAlert?.id ?? 'none'}`}
        alert={selectedAlert}
        onCancel={() => setSelectedAlert(null)}
        onComplete={result => {
          if (selectedAlert) {
            alertsService.update(selectedAlert.id, { status: 'resolved', result });
          }
          setSelectedAlert(null);
        }}
      />
    </Layout>
  );
};
