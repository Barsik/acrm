import { useState } from 'react';
import { X, CircleCheck } from 'lucide-react';
import { AlertStatusBadge, SeverityBadge } from '../../components/common';
import type { Alert } from '../../types';

export const alertTypeLabels: Record<string, string> = {
  volume_decline: 'Падение оборотов',
  expiring_certificate: 'Истечение СКЗИ',
  no_contact: 'Нет контакта',
  expiring_tariff: 'Истечение тарифа',
  inactive_product: 'Неактивный продукт',
};

export const severityLabels: Record<string, string> = {
  critical: 'Критичный', high: 'Высокий', medium: 'Средний', low: 'Низкий',
};

// '2026-06-09' → '09-06-2026'
const formatDate = (date: string) => date.split('-').reverse().join('-');

interface AlertViewModalProps {
  alert: Alert | null;
  onCancel: () => void;
  /** «Закрыть» — алерт закрывается с результатом обработки. */
  onComplete: (result: string) => void;
}

export const AlertViewModal = ({ alert, onCancel, onComplete }: AlertViewModalProps) => {
  const [result, setResult] = useState('');

  if (!alert) return null;

  const canClose = !!result.trim();

  const handleCancel = () => { setResult(''); onCancel(); };
  const handleComplete = () => {
    if (!canClose) return;
    onComplete(result.trim());
    setResult('');
  };

  const fields: Array<{ label: string; value: string }> = [
    { label: 'Дата', value: formatDate(alert.date) },
    { label: 'Тип', value: alertTypeLabels[alert.type] ?? alert.type },
    { label: 'Важность', value: severityLabels[alert.severity] ?? alert.severity },
    { label: 'Ответственный', value: alert.responsibleName },
    { label: 'Клиент/Холдинг', value: alert.entityName },
    { label: 'Источник', value: alert.source },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={handleCancel}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{alert.title}</h2>
              <SeverityBadge severity={alert.severity} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{alert.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AlertStatusBadge status={alert.status} />
            <button className="rounded-lg p-2 hover:bg-slate-100" onClick={handleCancel}><X size={18} /></button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Поля алерта — только для чтения */}
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {fields.map(f => (
              <div key={f.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{f.label}</span>
                <span className="mt-0.5 block truncate text-sm text-slate-800" title={f.value}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* Рекомендуемое действие */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Рекомендуемое действие</span>
            <span className="mt-0.5 block text-sm text-slate-800">{alert.recommendedAction}</span>
          </div>

          {/* Результат обработки алерта */}
          <label className="block text-xs font-semibold text-slate-600">
            Результат обработки алерта <span className="text-moex-red">*</span>
            <textarea
              rows={4}
              placeholder="Опишите результат обработки алерта…"
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
            title={canClose ? undefined : 'Внесите результат обработки алерта'}
            onClick={handleComplete}
          >
            <CircleCheck size={15} /> Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
