import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/layout/Layout';
import { TaskStatusBadge } from '../components/common';
import { tasksService } from '../services';
import { CreateTaskModal } from '../features/tasks/CreateTaskModal';
import { TaskViewModal } from '../features/tasks/TaskViewModal';
import type { Task } from '../types';
import { clientIdForEntity } from '../data/entityToClient';
import { CheckSquare, Plus, Filter } from 'lucide-react';

// '2026-06-09' → '09-06-2026'
const formatDueDate = (date: string) => date.split('-').reverse().join('-');

export const TasksPage = () => {
  const navigate = useNavigate();
  const { role } = useApp();
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'overdue'>('all');
  const [dueFilter, setDueFilter] = useState<'all' | 'today' | 'period'>('all');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const all = tasksService.getAll();

  // Открытие новой задачи автоматически переводит её в работу
  const openTask = (task: Task) => {
    if (task.status === 'open') tasksService.update(task.id, { status: 'in_progress' });
    setSelectedTask(task);
  };

  // Reference "today" — anchored to the page's presented date so Срок buckets contain tasks.
  const REF_DATE = new Date('2026-06-09T00:00:00');
  const REF_DATE_ISO = '2026-06-09';
  // ISO-строки дат сравниваются лексикографически
  const matchesDue = (dueDate: string) => {
    if (dueFilter === 'all') return true;
    if (dueFilter === 'today') return dueDate <= REF_DATE_ISO; // на сегодня, включая просроченные
    if (periodFrom && dueDate < periodFrom) return false;
    if (periodTo && dueDate > periodTo) return false;
    return true;
  };

  const byStatus = filter === 'all' ? all : all.filter(t => t.status === filter);
  const displayed = byStatus
    .filter(t =>
      matchesDue(t.dueDate) &&
      (typeFilter === 'all' || t.type === typeFilter) &&
      (priorityFilter === 'all' || t.priority === priorityFilter)
    )
    // Выполненные задачи опускаются в конец списка (sort стабильный — остальной порядок сохраняется)
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done'));

  const typeLabels: Record<string, string> = {
    call: 'Звонок', meeting: 'Встреча', document: 'Документ',
    escalation: 'Эскалация', cross_sell: 'Cross-sell', other: 'Прочее',
  };

  const priorityLabels: Record<string, string> = {
    critical: 'Критично', high: 'Высокий', medium: 'Средний', low: 'Низкий',
  };

  const priorityColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-amber-100 text-amber-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-slate-100 text-slate-600',
  };

  return (
    <Layout breadcrumbs={[{ label: 'Задачи' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <CheckSquare size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Задачи</h1>
        </div>
        <div className="ml-auto">
          <button className="btn-primary text-sm" onClick={() => setCreateOpen(true)}><Plus size={15} /> Создать задачу</button>
        </div>
      </div>

      {/* Stats — click a tile to filter */}
      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 max-sm:gap-3 mb-6">
        {([
          { key: 'all', label: 'Всего задач', count: all.length, accent: '#5A6478' },
          { key: 'open', label: 'Новых', count: all.filter(t => t.status === 'open').length, accent: '#4A90D9' },
          { key: 'in_progress', label: 'В работе', count: all.filter(t => t.status === 'in_progress').length, accent: '#12A05C' },
          { key: 'overdue', label: 'Просрочено', count: all.filter(t => t.status === 'overdue').length, accent: '#E8001C' },
        ] as const).map(s => {
          const active = filter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className="card"
              style={{
                textAlign: 'left', cursor: 'pointer', padding: '16px 18px',
                borderColor: active ? s.accent : '#E8EBF0',
                background: active ? `${s.accent}0A` : '#fff',
                boxShadow: active ? `0 4px 16px ${s.accent}1F` : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = '#C0C8D4'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#E8EBF0'; }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.count}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-sm font-medium text-slate-700">
          {filter === 'all' ? 'Все задачи' : filter === 'open' ? 'Новые' : filter === 'in_progress' ? 'В работе' : 'Просроченные'}
        </span>
        <span className="text-xs text-slate-400">· {displayed.length}</span>
        <div className="ml-auto flex flex-wrap items-center gap-3 max-md:ml-0">
          {/* Срок — segmented control */}
          <div className="flex items-center gap-1">
            <Filter size={13} className="text-slate-400 mr-0.5" />
            {([
              { key: 'all', label: 'Все' },
              { key: 'today', label: 'Сегодня' },
              { key: 'period', label: 'Период' },
            ] as const).map(o => {
              const active = dueFilter === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setDueFilter(o.key)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                    active
                      ? 'bg-moex-red/5 border-moex-red text-moex-red'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                  {o.label}
                </button>
              );
            })}
            {dueFilter === 'period' && (
              <div className="flex items-center gap-1 ml-1">
                <input
                  type="date"
                  value={periodFrom}
                  onChange={e => setPeriodFrom(e.target.value)}
                  className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
                />
                <span className="text-xs text-slate-400">—</span>
                <input
                  type="date"
                  value={periodTo}
                  onChange={e => setPeriodTo(e.target.value)}
                  className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
                />
              </div>
            )}
          </div>

          {/* Статус */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
          >
            <option value="all">Статус: все</option>
            <option value="open">Новая</option>
            <option value="in_progress">В работе</option>
            <option value="overdue">Просроченная</option>
          </select>

          {/* Тип */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
          >
            <option value="all">Тип: все</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Приоритет */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
          >
            <option value="all">Приоритет: любой</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Задача</th><th>Клиент/Холдинг</th><th>Срок</th>
              {role !== 'manager' && <th>Ответственный</th>}<th>Приоритет</th><th>Тип</th><th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openTask(t)}>
                <td>
                  <div className="text-sm font-medium text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{t.description}</div>
                </td>
                <td>
                  {t.entityId ? (
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={(e) => { e.stopPropagation(); navigate(`/clients/${clientIdForEntity(t.entityId) ?? t.entityId}`); }}
                    >
                      {t.entityName}
                    </button>
                  ) : (
                    <span className="text-sm text-slate-400">{t.entityName}</span>
                  )}
                </td>
                <td className={`text-xs font-medium ${new Date(t.dueDate + 'T00:00:00') < REF_DATE && t.status !== 'done' ? 'text-red-600' : 'text-slate-600'}`}>
                  {formatDueDate(t.dueDate)}
                </td>
                {role !== 'manager' && (
                  <td className="text-xs text-slate-600">{t.assigneeName}</td>
                )}
                <td>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${priorityColor[t.priority]}`}>
                    {priorityLabels[t.priority]}
                  </span>
                </td>
                <td><span className="badge-gray text-xs">{typeLabels[t.type]}</span></td>
                <td><TaskStatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <div className="text-center py-12 text-slate-400">Нет задач по выбранному фильтру</div>
        )}
      </div>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={task => tasksService.create(task)}
      />

      <TaskViewModal
        key={selectedTask?.id ?? 'none'}
        task={selectedTask}
        onCancel={() => setSelectedTask(null)}
        onComplete={result => {
          if (selectedTask) {
            tasksService.update(selectedTask.id, { status: 'done', result, completedAt: REF_DATE_ISO });
          }
          setSelectedTask(null);
        }}
      />
    </Layout>
  );
};
