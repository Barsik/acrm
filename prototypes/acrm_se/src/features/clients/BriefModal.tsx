import { X, Printer, FileText } from 'lucide-react';
import type { ClientRecord } from '../../data/mockDatabase';
import type { Alert, Task, Person, ProductUsage } from '../../types';
import { formatRevenue, formatVolume } from '../../data/mockData';

// '2026-06-09' → '09-06-2026'
const formatDate = (date: string) => date.split('-').reverse().join('-');

const taskStatusLabels: Record<string, string> = {
  open: 'Новая', in_progress: 'В работе', overdue: 'Просроченная', done: 'Выполнена',
};
const severityLabels: Record<string, string> = {
  critical: 'Критичный', high: 'Высокий', medium: 'Средний', low: 'Низкий',
};

interface BriefModalProps {
  open: boolean;
  client: ClientRecord;
  alerts: Alert[];
  tasks: Task[];
  persons: Person[];
  products: ProductUsage[];
  onClose: () => void;
}

/**
 * Brief к встрече — консолидированная сводка по клиенту в формате A4
 * с возможностью сохранить/распечатать (window.print, печатается только лист).
 */
export const BriefModal = ({ open, client, alerts, tasks, persons, products, onClose }: BriefModalProps) => {
  if (!open) return null;

  const openAlerts = alerts.filter(a => a.status !== 'resolved');
  const openTasks = tasks.filter(t => t.status !== 'done');
  const recommendations = openAlerts.map(a => a.recommendedAction).slice(0, 3);

  const section = 'border-b border-slate-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0';
  const sectionTitle = 'text-[11px] font-bold uppercase tracking-wider text-moex-red mb-2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-[230mm] flex-col rounded-2xl bg-slate-100 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-moex-red">
              <FileText size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">Brief к встрече</h2>
              <p className="truncate text-xs text-slate-500">{client.name} · формат A4</p>
            </div>
          </div>
          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Лист A4 */}
        <div className="flex-1 overflow-y-auto p-6 max-sm:p-3">
          <div className="brief-print-area mx-auto w-[210mm] max-w-full bg-white p-[15mm] shadow-lg" style={{ minHeight: '297mm' }}>
            {/* Шапка документа */}
            <div className="mb-5 flex items-start justify-between border-b-2 border-moex-red pb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-moex-red">Московская Биржа · aCRM</div>
                <h1 className="mt-1 text-xl font-bold text-slate-900">Brief к встрече: {client.name}</h1>
                <div className="mt-1 text-xs text-slate-500">
                  ИНН {client.inn} · {client.segment ?? '—'} · Статус: {client.status} · Менеджер: {client.manager}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>Дата подготовки</div>
                <div className="font-bold text-slate-800">09-06-2026</div>
              </div>
            </div>

            {/* Ключевые показатели */}
            <div className={section}>
              <div className={sectionTitle}>Ключевые показатели</div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Доход YTD', value: formatRevenue(client.turnover ?? 0) },
                  { label: 'Оборот YTD', value: formatVolume(client.turnover ?? 0) },
                  { label: 'Портфель', value: client.portfolio },
                  { label: 'Конечных клиентов', value: '72 000' },
                ].map(k => (
                  <div key={k.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] text-slate-400">{k.label}</div>
                    <div className="text-sm font-bold text-slate-900">{k.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Продукты */}
            <div className={section}>
              <div className={sectionTitle}>Продукты и сервисы</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="mb-1 font-bold text-slate-700">Активные</div>
                  {products.length > 0 ? products.map((p, i) => (
                    <div key={i} className="py-0.5 text-slate-700">• {p.productName}</div>
                  )) : <div className="text-slate-400">Нет данных</div>}
                </div>
                <div>
                  <div className="mb-1 font-bold text-slate-700">Потенциал подключения</div>
                  {['Денежный рынок', 'Товарный рынок'].map(name => (
                    <div key={name} className="py-0.5 text-slate-700">• {name}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Алерты */}
            <div className={section}>
              <div className={sectionTitle}>Открытые алерты ({openAlerts.length})</div>
              {openAlerts.length > 0 ? (
                <table className="w-full text-xs">
                  <tbody>
                    {openAlerts.map(a => (
                      <tr key={a.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-1.5 pr-2 font-semibold text-slate-800">{a.title}</td>
                        <td className="py-1.5 pr-2 text-slate-500">{severityLabels[a.severity]}</td>
                        <td className="py-1.5 text-right text-slate-500">{formatDate(a.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="text-xs text-slate-400">Открытых алертов нет</div>}
            </div>

            {/* Задачи */}
            <div className={section}>
              <div className={sectionTitle}>Открытые задачи ({openTasks.length})</div>
              {openTasks.length > 0 ? (
                <table className="w-full text-xs">
                  <tbody>
                    {openTasks.map(t => (
                      <tr key={t.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-1.5 pr-2 font-semibold text-slate-800">{t.title}</td>
                        <td className="py-1.5 pr-2 text-slate-500">{taskStatusLabels[t.status]}</td>
                        <td className="py-1.5 pr-2 text-slate-500">{t.assigneeName}</td>
                        <td className="py-1.5 text-right text-slate-500">{formatDate(t.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="text-xs text-slate-400">Открытых задач нет</div>}
            </div>

            {/* Контакты */}
            <div className={section}>
              <div className={sectionTitle}>Ключевые контакты</div>
              {persons.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {persons.slice(0, 6).map(p => (
                    <div key={p.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="font-bold text-slate-800">{p.fullName}</div>
                      <div className="text-slate-500">{p.title}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">{p.email} · {p.phone}</div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-xs text-slate-400">Нет контактов</div>}
            </div>

            {/* Рекомендации */}
            <div className={section}>
              <div className={sectionTitle}>Рекомендации к встрече</div>
              {recommendations.length > 0 ? (
                <ol className="list-decimal space-y-1 pl-4 text-xs text-slate-700">
                  {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ol>
              ) : (
                <div className="text-xs text-slate-700">
                  Обсудить текущее взаимодействие, удовлетворённость сервисом и потенциал подключения новых продуктов.
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-3 text-[9px] text-slate-400">
              Документ сформирован автоматически системой aCRM {formatDate('2026-06-09')}. Конфиденциально — для внутреннего использования.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 rounded-b-2xl border-t border-slate-200 bg-white px-6 py-4 print:hidden">
          <button className="btn-secondary text-sm" onClick={onClose}>Закрыть</button>
          <button className="btn-primary text-sm" onClick={() => window.print()}>
            <Printer size={15} /> Сохранить и распечатать
          </button>
        </div>
      </div>
    </div>
  );
};
