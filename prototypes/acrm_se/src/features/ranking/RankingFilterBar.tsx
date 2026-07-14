import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { RANKING_MARKETS, RANKING_PRODUCTS } from './rankingData';
import type { RankingFilters, RankingMetric } from './rankingData';

interface FilterSelectProps {
  label: string;
  value: string;
  values: (string | [string, string])[];
  onChange: (value: string) => void;
}

const FilterSelect = ({ label, value, values, onChange }: FilterSelectProps) => (
  <label className="min-w-0 border-r border-slate-200 px-3 py-2 last:border-r-0">
    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    <span className="relative mt-0.5 block">
      <select
        className="w-full appearance-none bg-transparent pr-5 text-xs font-semibold text-slate-800 outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {values.map(item => {
          const [optValue, optLabel] = Array.isArray(item) ? item : [item, item];
          return <option key={optValue} value={optValue}>{optLabel}</option>;
        })}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-0 top-0.5 text-slate-400" />
    </span>
  </label>
);

interface RankingFilterBarProps {
  filters: RankingFilters;
  onChange: (filters: RankingFilters) => void;
  onOpenSegment: () => void;
  showMetric?: boolean;
}

export const RankingFilterBar = ({ filters, onChange, onOpenSegment, showMetric = true }: RankingFilterBarProps) => {
  const products: [string, string][] = (RANKING_PRODUCTS[filters.market] || RANKING_PRODUCTS.ALL)
    .map((name, i) => [i === 0 ? 'ALL' : name, name]);
  return (
    <div className={`grid overflow-hidden rounded-xl border border-slate-200 bg-white ${
      showMetric ? 'lg:grid-cols-[1.2fr_1.4fr_1fr_1fr_1.1fr_auto]' : 'lg:grid-cols-[1.2fr_1.4fr_1fr_1.2fr_auto]'
    }`}>
      <FilterSelect
        label="Рынок"
        value={filters.market}
        values={RANKING_MARKETS}
        onChange={market => onChange({ ...filters, market, product: 'ALL' })}
      />
      <FilterSelect
        label="Продукт"
        value={filters.product}
        values={products}
        onChange={product => onChange({ ...filters, product })}
      />
      <FilterSelect
        label="Тип клиента"
        value={filters.clientType}
        values={['ФЛ', 'ЮЛ', 'ФЛ + ЮЛ']}
        onChange={clientType => onChange({ ...filters, clientType })}
      />
      {showMetric && (
        <FilterSelect
          label="Метрика"
          value={filters.metric}
          values={[['turnover', 'Оборот'], ['clients', 'Клиенты'], ['auc', 'AuC']]}
          onChange={metric => onChange({ ...filters, metric: metric as RankingMetric })}
        />
      )}
      <FilterSelect
        label="Период"
        value={filters.period}
        values={['2025-01 — 2026-05']}
        onChange={period => onChange({ ...filters, period })}
      />
      <button
        className="flex items-center justify-center gap-2 border-t border-slate-200 px-4 py-3 text-xs font-semibold text-blue-700 hover:bg-blue-50 lg:border-l lg:border-t-0"
        onClick={onOpenSegment}
      >
        <SlidersHorizontal size={14} /> Все фильтры
      </button>
    </div>
  );
};
