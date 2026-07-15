import { useState } from 'react';
import { X, CircleCheck } from 'lucide-react';
import { TaskStatusBadge } from '../../components/common';
import type { Task } from '../../types';

const typeLabels: Record<string, string> = {
  call: 'Звонок', meeting: 'Встреча', document: 'Документ',
  escalation: 'Эскалация', cross_sell: 'Cross-sell', other: 'Прочее',
};

const priorityLabels: Record<string, string> = {
  critical: 'Критично', high: 'Высокий', medium: 'Средний', low: 'Низкий',
};

// '2026-06-09' → '09-06-2026'
const formatDate = (date: string) => date.split('-').reverse().join('-');

interface TaskViewModalProps {
  task: Task | null;
  onCancel: () => void;
  /** «Закрыть» — задача закрывается с результатом обработки. */
  onComplete: (result: string) => void;
}

export const TaskViewModal = ({ task, onCancel, onComplete }: TaskViewModalProps) => {
  const [result, setResult] = useState('');

  if (!task) return null;

  const canClose = !!result.trim();

  const handleCancel = () => { setResult(''); onCancel(); };
  const handleComplete = () => {
    if (!canClose) return;
    onComplete(result.trim());
    setResult('');
  };

  const fields: Array<{ label: string; value: string }> = [
    { label: 'Срок', value: formatDate(task.dueDate) },
    { label: 'Тип', value: typeLabels[task.type] ?? task.type },
    { label: 'Приоритет', value: priorityLabels[task.priority] ?? task.priority },
    { label: 'Ответственный', value: task.assigneeName },
    { label: 'Клиент/Холдинг', value: task.entityName },
    { label: 'Создана', value: formatDate(task.createdAt) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={handleCancel}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
            {task.description && (
              <p className="mt-0.5 text-xs text-slate-500">{task.description}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <button className="rounded-lg p-2 hover:bg-slate-100" onClick={handleCancel}><X size={18} /></button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {/* Поля задачи — только для чтения */}
          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{f.label}</span>
                <span className="mt-0.5 block truncate text-sm text-slate-800" title={f.value}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* Результат обработки задачи */}
          <label className="block text-xs font-semibold text-slate-600">
            Результат обработки задачи <span className="text-moex-red">*</span>
            <textarea
              rows={4}
              placeholder="Опишите результат обработки задачи…"
              value={result}
              onChange={e => setResult(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-moex-red"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button className="btn-secondary text-sm" onClick={handleCancel}>Отмена</button>
          <button
            className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canClose}
            title={canClose ? undefined : 'Внесите результат обработки задачи'}
            onClick={handleComplete}
          >
            <CircleCheck size={15} /> Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
