import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/common';
import { tasksService } from '../services';
import { CheckSquare, Plus, Filter } from 'lucide-react';

export const TasksPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'overdue'>('all');
  const all = tasksService.getAll();
  const displayed = filter === 'all' ? all
    : filter === 'overdue' ? tasksService.getOverdue()
    : all.filter(t => t.status === filter);

  const typeLabels: Record<string, string> = {
    call: 'Звонок', meeting: 'Встреча', document: 'Документ',
    escalation: 'Эскалация', cross_sell: 'Cross-sell', other: 'Прочее',
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
          <h1 className="text-2xl font-bold text-slate-900">Задачи и договорённости</h1>
          <p className="text-sm text-slate-500">Все активные задачи · 09.06.2026</p>
        </div>
        <div className="ml-auto">
          <button className="btn-primary text-sm"><Plus size={15} /> Создать задачу</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Всего задач', count: all.length },
          { label: 'Открытых', count: all.filter(t => t.status === 'open').length },
          { label: 'В работе', count: all.filter(t => t.status === 'in_progress').length },
          { label: 'Просрочено', count: tasksService.getOverdue().length },
        ].map(s => (
          <div key={s.label} className="kpi-card">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{s.label}</div>
            <div className="text-3xl font-bold text-slate-900">{s.count}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {(['all', 'open', 'in_progress', 'overdue'] as const).map(f => (
          <button
            key={f}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === f ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Все' : f === 'open' ? 'Открытые' : f === 'in_progress' ? 'В работе' : 'Просрочены'}
          </button>
        ))}
        <button className="ml-auto btn-secondary text-xs"><Filter size={13} /> Фильтры</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Задача</th><th>Тип</th><th>Клиент/Холдинг</th>
              <th>Приоритет</th><th>Исполнитель</th><th>Срок</th><th>Статус</th><th></th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 cursor-pointer">
                <td>
                  <div className="text-sm font-medium text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{t.description}</div>
                </td>
                <td><span className="badge-gray text-xs">{typeLabels[t.type]}</span></td>
                <td>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={(e) => { e.stopPropagation(); navigate(`/holdings/${t.entityId}`); }}
                  >
                    {t.entityName}
                  </button>
                </td>
                <td>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${priorityColor[t.priority]}`}>
                    {t.priority === 'critical' ? 'Критично' : t.priority === 'high' ? 'Высокий' : t.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                </td>
                <td className="text-xs text-slate-600">{t.assigneeName}</td>
                <td className={`text-xs font-medium ${new Date(t.dueDate) < new Date() && t.status !== 'done' ? 'text-red-600' : 'text-slate-600'}`}>
                  {t.dueDate}
                </td>
                <td><StatusBadge status={t.status} /></td>
                <td>
                  <div className="flex gap-1">
                    <button className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">Открыть</button>
                    {t.status !== 'done' && (
                      <button className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded border border-green-200 hover:bg-green-50">Закрыть</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <div className="text-center py-12 text-slate-400">Нет задач по выбранному фильтру</div>
        )}
      </div>
    </Layout>
  );
};
