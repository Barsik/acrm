import { RankingFilterBar } from '../ranking/RankingFilterBar';
import { fmt } from '../ranking/rankingData';
import type { RankingFilters } from '../ranking/rankingData';
import {
  AUC_GROUPS, FREQUENCIES, MATRIX_META, buildMatrix, selectionValue, selectionOwnShare,
} from './analyticsData';
import type { MatrixMetric, MatrixSelection } from './analyticsData';

interface PortfolioStructureProps {
  filters: RankingFilters;
  setFilters: (filters: RankingFilters) => void;
  openSegment: () => void;
  metric: MatrixMetric;
  setMetric: (metric: MatrixMetric) => void;
  selection: MatrixSelection;
  setSelection: (selection: MatrixSelection) => void;
  goToDynamics: () => void;
  goToExternal: () => void;
}

export const PortfolioStructure = ({
  filters, setFilters, openSegment, metric, setMetric, selection, setSelection, goToDynamics, goToExternal,
}: PortfolioStructureProps) => {
  const matrix = buildMatrix(metric);
  const total = matrix.reduce((sum, row) => sum + row.reduce((s, v) => s + v, 0), 0);
  const maxCell = Math.max(...matrix.flat());
  const unit = MATRIX_META[metric].unit;

  const selected = selectionValue(matrix, selection);
  const ownShare = selectionOwnShare(selection);
  const competitorShare = ownShare + ((selection.col ?? 2) < 3 ? 1.4 : -0.7);
  const ownValue = (selected * ownShare) / 100;
  const competitorValue = (selected * competitorShare) / 100;

  const isSelected = (row: number, col: number) =>
    selection.type === 'all' ||
    (selection.type === 'row' && selection.row === row) ||
    (selection.type === 'column' && selection.col === col) ||
    (selection.type === 'cell' && selection.row === row && selection.col === col);

  return (
    <>
      <RankingFilterBar filters={filters} onChange={setFilters} onOpenSegment={openSegment} showMetric={false} />
      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-red-600">Сравнение портфелей</div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Брокер, ближайшие конкуренты и рынок</h2>
          <p className="mt-1 text-xs text-slate-500">Поведенческие портфели и AuC-сегменты выбранной клиентской группы</p>
        </div>

        <div className="border-b border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Матрица: AuC-группа × частота сделок</h3>
              <p className="text-[10px] text-slate-500">
                {MATRIX_META[metric].label} и доля от общего значения · выберите ячейку для детализации
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg bg-slate-100 p-1">
                {(Object.entries(MATRIX_META) as [MatrixMetric, { label: string }][]).map(([key, meta]) => (
                  <button
                    key={key}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                      metric === key ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
                    }`}
                    onClick={() => setMetric(key)}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500">
                Всего: <strong className="text-slate-800">{fmt.format(total)} {unit}</strong>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[980px] grid-cols-[150px_repeat(5,minmax(125px,1fr))_120px] gap-1.5">
              <button
                className={`rounded-lg px-2 py-2 text-center text-[10px] font-bold transition ${
                  selection.type === 'all'
                    ? 'bg-red-50 text-red-600 ring-2 ring-inset ring-red-500'
                    : 'bg-slate-100 text-slate-600 hover:ring-2 hover:ring-inset hover:ring-blue-300'
                }`}
                onClick={() => setSelection({ type: 'all' })}
              >
                Все
              </button>
              {FREQUENCIES.map((freq, col) => (
                <button
                  key={freq}
                  className={`rounded-lg px-2 py-2 text-center text-[10px] font-bold transition ${
                    selection.type === 'column' && selection.col === col
                      ? 'bg-red-50 text-red-600 ring-2 ring-inset ring-red-500'
                      : 'bg-slate-100 text-slate-600 hover:ring-2 hover:ring-inset hover:ring-blue-300'
                  }`}
                  onClick={() => setSelection({ type: 'column', col })}
                >
                  {freq}
                </button>
              ))}
              <div className="rounded-lg bg-slate-200 px-2 py-2 text-center text-[10px] font-bold text-slate-700">Итого</div>

              {AUC_GROUPS.map((group, row) => {
                const rowTotal = matrix[row].reduce((s, v) => s + v, 0);
                return [
                  <button
                    key={`${group.group}-label`}
                    className={`flex flex-col justify-center rounded-lg px-3 py-2 text-left transition ${
                      selection.type === 'row' && selection.row === row
                        ? 'bg-red-50 ring-2 ring-inset ring-red-500'
                        : 'bg-slate-50 hover:ring-2 hover:ring-inset hover:ring-blue-300'
                    }`}
                    onClick={() => setSelection({ type: 'row', row })}
                  >
                    <strong className="text-xs text-slate-900">{group.group}</strong>
                    <small className="text-[9px] text-slate-500">{group.range}</small>
                  </button>,
                  ...matrix[row].map((value, col) => {
                    const intensity = Math.min(1, value / maxCell);
                    return (
                      <button
                        key={`${group.group}-${col}`}
                        className={`min-h-16 rounded-lg px-2 py-2 text-left transition ${
                          isSelected(row, col) ? 'ring-2 ring-red-500 ring-inset' : 'hover:ring-2 hover:ring-blue-300'
                        }`}
                        style={{
                          backgroundColor: intensity > 0.78 ? 'rgba(232,0,28,0.78)' : `rgba(37,99,235,${0.16 + intensity * 0.72})`,
                          color: intensity > 0.28 ? 'white' : '#1E293B',
                        }}
                        onClick={() => setSelection({ type: 'cell', row, col })}
                      >
                        <strong className="block text-xs">{fmt.format(value)} {unit}</strong>
                        <small className="mt-1 block text-[9px] opacity-80">{fmt.format((value / total) * 100)}% от всех</small>
                      </button>
                    );
                  }),
                  <button
                    key={`${group.group}-total`}
                    className={`flex min-h-16 flex-col justify-center rounded-lg px-3 py-2 text-left transition ${
                      selection.type === 'row' && selection.row === row
                        ? 'bg-red-50 ring-2 ring-inset ring-red-500'
                        : 'bg-slate-200 hover:ring-2 hover:ring-inset hover:ring-blue-300'
                    }`}
                    onClick={() => setSelection({ type: 'row', row })}
                  >
                    <strong className="text-xs text-slate-900">{fmt.format(rowTotal)} {unit}</strong>
                    <small className="text-[9px] text-slate-500">итого</small>
                  </button>,
                ];
              })}

              <div className="flex flex-col justify-center rounded-lg bg-slate-200 px-3 py-2">
                <strong className="text-xs">Итого</strong>
                <small className="text-[9px] text-slate-500">по частоте</small>
              </div>
              {FREQUENCIES.map((freq, col) => {
                const colTotal = matrix.reduce((s, row) => s + row[col], 0);
                return (
                  <button
                    key={`${freq}-total`}
                    className={`flex min-h-14 flex-col justify-center rounded-lg px-3 py-2 text-center transition ${
                      selection.type === 'column' && selection.col === col
                        ? 'bg-red-50 ring-2 ring-inset ring-red-500'
                        : 'bg-slate-200 hover:ring-2 hover:ring-inset hover:ring-blue-300'
                    }`}
                    onClick={() => setSelection({ type: 'column', col })}
                  >
                    <strong className="text-xs">{fmt.format(colTotal)} {unit}</strong>
                    <small className="text-[9px] text-slate-500">итого</small>
                  </button>
                );
              })}
              <button
                className={`flex min-h-14 flex-col justify-center rounded-lg bg-slate-800 px-3 py-2 text-center text-white transition ${
                  selection.type === 'all' ? 'ring-2 ring-inset ring-red-500' : 'hover:ring-2 hover:ring-inset hover:ring-blue-300'
                }`}
                onClick={() => setSelection({ type: 'all' })}
              >
                <strong className="text-xs">{fmt.format(total)} {unit}</strong>
                <small className="text-[9px] text-slate-300">всего</small>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-blue-700">
                {fmt.format(selected)} {unit} · {fmt.format((selected / total) * 100)}% общего значения
              </span>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-[10px] font-bold text-blue-700 transition hover:bg-blue-50"
                onClick={goToDynamics}
              >
                Смотреть ЖЦ в динамике →
              </button>
              <button
                className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-blue-700"
                onClick={goToExternal}
              >
                Анализ внешнего портфеля →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-bold">Бенчмарк выбранной области · {MATRIX_META[metric].label}</h3>
              <p className="mt-0.5 text-[10px] text-slate-500">Сравнение автоматически обновляется при выборе сегмента в матрице</p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th>Сегмент</th><th>Брокер</th><th>Конкуренты</th><th>Рынок</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Выбранная область</strong></td>
                    <td className={ownValue >= competitorValue ? 'bg-emerald-50' : 'bg-amber-50'}>
                      <strong>{fmt.format(ownValue)} {unit}</strong>
                      <small className="mt-0.5 block text-slate-500">доля рынка {fmt.format(ownShare)}%</small>
                    </td>
                    <td>
                      <strong>{fmt.format(competitorValue)} {unit}</strong>
                      <small className="mt-0.5 block text-slate-500">доля рынка {fmt.format(competitorShare)}%</small>
                    </td>
                    <td>
                      <strong>{fmt.format(selected)} {unit}</strong>
                      <small className="mt-0.5 block text-slate-500">рынок выбранного сегмента</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="grid border-t border-slate-200 sm:grid-cols-3">
              <div className="p-4">
                <span className="text-[10px] text-slate-500">Разрыв к конкурентам</span>
                <strong className={`block text-base ${ownValue >= competitorValue ? 'text-emerald-600' : 'text-red-600'}`}>
                  {ownValue >= competitorValue ? '+' : ''}{fmt.format(ownShare - competitorShare)} п.п.
                </strong>
              </div>
              <div className="border-t border-slate-200 p-4 sm:border-l sm:border-t-0">
                <span className="text-[10px] text-slate-500">Позиция брокера</span>
                <strong className="block text-base">{ownValue >= competitorValue ? 'Выше конкурентов' : 'Ниже конкурентов'}</strong>
              </div>
              <div className="border-t border-slate-200 p-4 sm:border-l sm:border-t-0">
                <span className="text-[10px] text-slate-500">Доля сегмента в {MATRIX_META[metric].label.toLowerCase()}</span>
                <strong className="block text-base">{fmt.format((selected / total) * 100)}%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
