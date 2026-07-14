import { useState } from 'react';
import { X, ShieldCheck, CircleCheck } from 'lucide-react';
import {
  DEFAULT_RANKING_FILTERS, RANKING_MARKETS, RANKING_PRODUCTS, RANKING_REGIONS, fmt,
} from './rankingData';
import type { RankingFilters, SegmentDimensions, DimensionKey } from './rankingData';

type ChipTone = 'blue' | 'violet' | 'red';

const CHIP_ACTIVE: Record<ChipTone, string> = {
  blue: 'border-blue-600 bg-blue-50 text-blue-700',
  violet: 'border-violet-600 bg-violet-50 text-violet-700',
  red: 'border-red-500 bg-red-50 text-red-700',
};

interface SegmentBuilderModalProps {
  open: boolean;
  filters: RankingFilters;
  onClose: () => void;
  onApply: (filters: RankingFilters) => void;
}

export const SegmentBuilderModal = ({ open, filters, onClose, onApply }: SegmentBuilderModalProps) => {
  const [local, setLocal] = useState(filters);
  const [aucGroups, setAucGroups] = useState(filters.segmentDefinition.aucGroups);
  const [dimensions, setDimensions] = useState<SegmentDimensions>(filters.segmentDefinition.dimensions);
  const [cohort, setCohort] = useState(filters.segmentDefinition.cohort);
  const [tradePeriod, setTradePeriod] = useState(filters.segmentDefinition.tradePeriod);

  if (!open) return null;

  const toggleAucGroup = (value: string) =>
    setAucGroups(aucGroups.includes(value) ? aucGroups.filter(g => g !== value) : [...aucGroups, value]);

  const toggleDimension = (key: DimensionKey, value: string) =>
    setDimensions(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
    }));

  const products = RANKING_PRODUCTS[local.market] || RANKING_PRODUCTS.ALL;

  const conditionsCount =
    aucGroups.length +
    Object.values(dimensions).reduce((sum, values) => sum + values.length, 0) +
    +!!tradePeriod.enabled +
    (local.market === 'ALL' ? 0 : 1) +
    (local.product === 'ALL' ? 0 : 1);

  const segmentLabel = [
    aucGroups.length ? aucGroups.join(' + ') : 'Все AuC-группы',
    dimensions.frequency.length === 1 ? dimensions.frequency[0] : null,
  ].filter(Boolean).join(' · ');

  const estimatedClients = Math.max(0.1, 13205.5 * 0.62 ** Math.max(0, conditionsCount - 1));
  const hiddenCells = conditionsCount > 12 ? 7 : conditionsCount > 8 ? 3 : 0;

  const renderChips = (key: DimensionKey, options: string[], tone: ChipTone = 'blue') => (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
            dimensions[key].includes(option) ? CHIP_ACTIVE[tone] : 'border-slate-200 text-slate-600'
          }`}
          onClick={() => toggleDimension(key, option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35" onMouseDown={onClose}>
      <aside className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Конструктор сегмента</h2>
            <p className="text-xs text-slate-500">Контекст применяется ко всем аналитическим разделам</p>
          </div>
          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Период и когорта</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] text-slate-500">Период анализа</span>
                <strong className="mt-1 block text-xs text-slate-900">2025-01 — 2026-05</strong>
                <small className="text-[9px] text-slate-400">предыдущий полный и текущий год</small>
              </div>
              <label className="text-xs text-slate-500">
                Счёт открыт от
                <input
                  type="month"
                  value={cohort.from}
                  onChange={e => setCohort({ ...cohort, from: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-slate-800"
                />
              </label>
              <label className="text-xs text-slate-500">
                Счёт открыт до
                <input
                  type="month"
                  value={cohort.to}
                  onChange={e => setCohort({ ...cohort, to: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-slate-800"
                />
              </label>
            </div>
            <div className={`mt-3 grid gap-3 rounded-xl border p-3 sm:grid-cols-3 ${
              tradePeriod.enabled ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <button
                className="flex items-center gap-3 rounded-lg text-left"
                onClick={() => setTradePeriod({ ...tradePeriod, enabled: !tradePeriod.enabled })}
              >
                <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${tradePeriod.enabled ? 'bg-red-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${tradePeriod.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                </span>
                <span>
                  <strong className="block text-xs text-slate-800">Были сделки за период</strong>
                  <small className="text-[9px] text-slate-500">хотя бы одна сделка</small>
                </span>
              </button>
              <label className={`text-xs ${tradePeriod.enabled ? 'text-slate-500' : 'text-slate-400'}`}>
                Сделки от
                <input
                  type="month"
                  value={tradePeriod.from}
                  disabled={!tradePeriod.enabled}
                  onChange={e => setTradePeriod({ ...tradePeriod, from: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
              <label className={`text-xs ${tradePeriod.enabled ? 'text-slate-500' : 'text-slate-400'}`}>
                Сделки до
                <input
                  type="month"
                  value={tradePeriod.to}
                  disabled={!tradePeriod.enabled}
                  onChange={e => setTradePeriod({ ...tradePeriod, to: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Тип клиента</h3>
            <div className="flex flex-wrap gap-2">
              {['ФЛ', 'ЮЛ', 'ФЛ + ЮЛ'].map(type => (
                <button
                  key={type}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    local.clientType === type ? CHIP_ACTIVE.blue : 'border-slate-200 text-slate-600'
                  }`}
                  onClick={() => setLocal({ ...local, clientType: type })}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">География</h3>
            <div className="space-y-3">
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Тип территории</span>
                {renderChips('geography', ['Вся Россия', 'Москва', 'Санкт-Петербург', 'Регионы-миллионники'])}
              </div>
              <label className="block text-[10px] text-slate-500">
                Регион
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                  value={dimensions.region[0] ?? 'ALL'}
                  onChange={e => setDimensions(prev => ({
                    ...prev,
                    region: e.target.value === 'ALL' ? [] : [e.target.value],
                  }))}
                >
                  <option value="ALL">Все регионы</option>
                  {RANKING_REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">AuC-группа</h3>
            <div className="flex flex-wrap gap-2">
              {['Mini Mass', 'Mass', 'Affluent', 'HNWI', 'UHNWI'].map(group => (
                <button
                  key={group}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    aucGroups.includes(group) ? CHIP_ACTIVE.blue : 'border-slate-200 text-slate-600'
                  }`}
                  onClick={() => toggleAucGroup(group)}
                >
                  {group}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Клиентский цикл</h3>
            <div className="space-y-3">
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Статус счёта</span>
                {renderChips('accountStatus', ['Счёт открыт', 'Новый без сделок', 'Активный', 'Спящий', 'Нулевой AuC', 'Счёт закрыт'])}
              </div>
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Активация</span>
                {renderChips('activation', ['Первое пополнение', 'Первая сделка ≤ 30 дней', 'Первая сделка ≤ 90 дней'], 'violet')}
              </div>
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Событие оттока</span>
                {renderChips('churn', ['Стал спящим', 'Обнулил AuC', 'Закрыл счёт'], 'red')}
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Торговая активность</h3>
            <div className="space-y-3">
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Частота сделок</span>
                {renderChips('frequency', ['Реже раза в год (спящие)', 'Раз в год', 'Раз в квартал', 'Раз в месяц', 'Ежедневно'], 'violet')}
              </div>
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Режим торговли</span>
                {renderChips('tradingMode', ['Не HFT', 'HFT / ALGO'])}
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Рынок и продукт</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="rounded-lg border border-slate-200 p-2.5 text-xs"
                value={local.market}
                onChange={e => setLocal({ ...local, market: e.target.value, product: 'ALL' })}
              >
                {RANKING_MARKETS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select
                className="rounded-lg border border-slate-200 p-2.5 text-xs"
                value={local.product}
                onChange={e => setLocal({ ...local, product: e.target.value })}
              >
                {products.map((product, i) => (
                  <option key={product} value={i === 0 ? 'ALL' : product}>{product}</option>
                ))}
              </select>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Внешний портфель</h3>
            <div className="space-y-3">
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Где есть активность</span>
                {renderChips('brokerPresence', ['Только у нас', 'В нескольких брокерах'])}
              </div>
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Наша роль в кошельке</span>
                {renderChips('walletRole', ['Мы — основной', 'Мы — второй', 'Мы — периферийный'], 'violet')}
              </div>
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Количество брокеров</span>
                {renderChips('brokerCount', ['1 брокер', '2 брокера', '3–4 брокера', '5 и более'])}
              </div>
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Активность вне нас</span>
                {renderChips('externalActivity', ['Неактивен вне нас', 'Слабее вне нас', 'Сопоставимо', 'Активнее вне нас'], 'red')}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-900">
              <ShieldCheck size={16} /> Проверка выдачи
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div>
                <span className="text-emerald-700">Клиентов</span>
                <strong className="block text-emerald-950">{fmt.format(estimatedClients)} тыс.</strong>
              </div>
              <div>
                <span className="text-emerald-700">Условий сегмента</span>
                <strong className="block text-emerald-950">{conditionsCount}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Скрыто ячеек</span>
                <strong className="block text-emerald-950">{hiddenCells}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Приватность</span>
                <strong className="block text-emerald-950">{estimatedClients >= 0.05 ? 'OK' : 'Малая выборка'}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Когорта открытия</span>
                <strong className="block text-emerald-950">{cohort.from} — {cohort.to}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Сделки за период</span>
                <strong className="block text-emerald-950">
                  {tradePeriod.enabled ? `${tradePeriod.from} — ${tradePeriod.to}` : 'Не задано'}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between border-t border-slate-200 p-4">
          <button
            className="btn-secondary"
            onClick={() => {
              setLocal(DEFAULT_RANKING_FILTERS);
              setAucGroups(DEFAULT_RANKING_FILTERS.segmentDefinition.aucGroups);
              setDimensions(DEFAULT_RANKING_FILTERS.segmentDefinition.dimensions);
              setCohort(DEFAULT_RANKING_FILTERS.segmentDefinition.cohort);
              setTradePeriod(DEFAULT_RANKING_FILTERS.segmentDefinition.tradePeriod);
            }}
          >
            Сбросить
          </button>
          <button
            className="btn-primary"
            onClick={() => onApply({
              ...local,
              segment: segmentLabel || 'Все клиенты',
              segmentDefinition: { aucGroups, dimensions, cohort, tradePeriod },
            })}
          >
            <CircleCheck size={14} /> Применить · {conditionsCount} условий
          </button>
        </div>
      </aside>
    </div>
  );
};
