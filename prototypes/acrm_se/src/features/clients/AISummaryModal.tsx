import { useEffect, useState } from 'react';
import { X, Brain, Loader2, Globe, Newspaper, TrendingUp, ShieldCheck } from 'lucide-react';
import type { ClientRecord } from '../../data/mockDatabase';

interface AISummaryModalProps {
  open: boolean;
  client: ClientRecord;
  onClose: () => void;
}

/**
 * AI-сводка по компании: имитация сбора информации из открытых источников
 * (в проде — запрос к AI/LLM-сервису с поиском по СМИ, СПАРК, Интерфакс и т.п.).
 */
export const AISummaryModal = ({ open, client, onClose }: AISummaryModalProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const sections = [
    {
      icon: <Globe size={15} />,
      title: 'Общие сведения (сайт компании, СПАРК)',
      body: `${client.name} — ${client.type === 'Юр. лицо' ? 'юридическое лицо' : 'физическое лицо'}, ИНН ${client.inn}. Сегмент: ${client.segment ?? '—'}. Статус на бирже: ${client.status.toLowerCase()}. Портфель: ${client.portfolio}. Закреплённый менеджер — ${client.manager}.`,
    },
    {
      icon: <Newspaper size={15} />,
      title: 'Публикации в СМИ (Интерфакс, РБК, Ведомости)',
      body: `За последние 30 дней найдено 12 упоминаний. Ключевые темы: расширение продуктовой линейки, кадровые назначения в финансовом блоке, участие в отраслевых конференциях. Негативных публикаций не обнаружено.`,
    },
    {
      icon: <TrendingUp size={15} />,
      title: 'Финансовые сигналы (отчётность, раскрытие)',
      body: `Оборот YTD в системе — ${(client.turnover ?? 0).toLocaleString('ru-RU')} ₽. По данным открытой отчётности, выручка за последний период выросла; долговая нагрузка умеренная. Кредитные рейтинги стабильны.`,
    },
    {
      icon: <ShieldCheck size={15} />,
      title: 'Риски и ограничения',
      body: client.restrictions === 'да'
        ? 'Обнаружены санкционные ограничения — при работе учитывать комплаенс-требования. '
          + (client.alertList?.length ? `Открытых алертов в системе: ${client.alertList.length}.` : 'Открытых алертов в системе нет.')
        : (client.alertList?.length
          ? `Санкционных ограничений не выявлено. Открытых алертов в системе: ${client.alertList.length}.`
          : 'Санкционных ограничений не выявлено, открытых алертов нет.'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-moex-red">
              <Brain size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">AI-сводка</h2>
              <p className="truncate text-xs text-slate-500">{client.name}</p>
            </div>
          </div>
          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <Loader2 size={36} className="animate-spin text-moex-red" />
              <div>
                <div className="text-sm font-semibold text-slate-800">AI-ассистент собирает информацию…</div>
                <div className="mt-1 text-xs text-slate-500">
                  Анализируются открытые источники: сайт компании, СПАРК, Интерфакс, СМИ, раскрытие отчётности
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map(s => (
                <div key={s.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-moex-red">{s.icon}</span> {s.title}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{s.body}</p>
                </div>
              ))}
              <p className="text-[10px] text-slate-400">
                Сводка сгенерирована AI-ассистентом на основе открытых источников и данных системы. Проверяйте критичные факты перед использованием.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button className="btn-secondary text-sm" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};
