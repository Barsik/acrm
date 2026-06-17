import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { SectionHeader, StatusBadge, SeverityBadge, PageTitle } from '../components/common';
import { operationsService } from '../services';
import { Settings, AlertTriangle, Clock, CheckSquare, Filter } from 'lucide-react';

const SLABar = ({ remaining, total }: { remaining: number; total: number }) => {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  const color = pct > 60 ? 'bg-green-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-200 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold ${remaining < 0 ? 'text-red-600' : remaining < total * 0.2 ? 'text-amber-600' : 'text-slate-600'}`}>
        {remaining < 0 ? `+${Math.abs(remaining)}ч` : `${remaining}ч`}
      </span>
    </div>
  );
};

export const OperationsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'critical'>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const allRequests = operationsService.getAll();
  const overdue = operationsService.getOverdue();
  const critical = operationsService.getCritical();

  const displayed = activeTab === 'overdue' ? overdue : activeTab === 'critical' ? critical : allRequests;
  const selectedReq = selected ? allRequests.find(r => r.id === selected) : null;

  const typeLabels: Record<string, string> = {
    incident: 'Инцидент',
    request: 'Заявка',
    document: 'Документ',
    task: 'Задача',
  };

  return (
    <Layout breadcrumbs={[{ label: 'Операционный контур oCRM' }]}>
      <PageTitle
        icon={<Settings size={22} />}
        accent="#5A6478"
        title="Операционный контур"
        subtitle="oCRM · Обращения и заявки · 09.06.2026"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="kpi-card">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Всего обращений</div>
          <div className="text-2xl font-bold text-slate-900">{allRequests.length}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Критичных</div>
          <div className="text-2xl font-bold text-red-600">{critical.length}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Просрочено SLA</div>
          <div className="text-2xl font-bold text-amber-600">{overdue.length}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Среднее время</div>
          <div className="text-2xl font-bold text-slate-900">4.2ч</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* List */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 mb-4">
            {[
              { key: 'all', label: 'Все', count: allRequests.length },
              { key: 'critical', label: 'Критичные', count: critical.length },
              { key: 'overdue', label: 'Просрочено', count: overdue.length },
            ].map(tab => (
              <button
                key={tab.key}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
            <button className="ml-auto btn-secondary text-xs"><Filter size={13} /> Фильтры</button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>№</th><th>Тип</th><th>Название</th><th>Клиент</th>
                  <th>Приоритет</th><th>Ответственный</th><th>SLA</th><th>Статус</th><th></th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(r => (
                  <tr
                    key={r.id}
                    className={`cursor-pointer hover:bg-slate-50 ${selected === r.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelected(selected === r.id ? null : r.id)}
                  >
                    <td className="text-xs font-mono text-slate-500">{r.number}</td>
                    <td><span className="badge-gray text-xs">{typeLabels[r.type]}</span></td>
                    <td>
                      <div className="text-sm font-medium text-slate-900 max-w-[200px] truncate">{r.title}</div>
                    </td>
                    <td className="text-sm text-slate-600">{r.clientName}</td>
                    <td><SeverityBadge severity={r.priority} /></td>
                    <td className="text-xs text-slate-500">{r.assignee}</td>
                    <td><SLABar remaining={r.slaRemaining} total={r.sla} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          Взять
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedReq && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-5 lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-500">{selectedReq.number}</span>
                <StatusBadge status={selectedReq.status} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{selectedReq.title}</h3>
              <div className="text-sm text-slate-600 mb-4">{selectedReq.clientName}</div>

              <div className="space-y-2 mb-5">
                {[
                  ['Тип', typeLabels[selectedReq.type]],
                  ['Приоритет', selectedReq.priority],
                  ['Ответственный', selectedReq.assignee],
                  ['Подразделение', selectedReq.department],
                  ['Создано', selectedReq.createdAt.split('T')[0]],
                  ['Обновлено', selectedReq.updatedAt.split('T')[0]],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-500 mb-1">Описание</div>
                <p className="text-xs text-slate-700">{selectedReq.description}</p>
              </div>

              <div className="space-y-2">
                <button className="btn-primary w-full text-xs justify-center">
                  <CheckSquare size={14} /> Взять в работу
                </button>
                <button className="btn-secondary w-full text-xs justify-center">
                  Передать в подразделение
                </button>
                <button className="btn-secondary w-full text-xs justify-center text-amber-600 border-amber-200 hover:bg-amber-50">
                  <AlertTriangle size={14} /> Эскалировать
                </button>
                <button className="btn-secondary w-full text-xs justify-center text-green-600 border-green-200 hover:bg-green-50">
                  <CheckSquare size={14} /> Закрыть обращение
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
