import { fmt } from '../ranking/rankingData';

interface PaceCardProps {
  title: string;
  subtitle: string;
  /** [название, значение %, цвет] */
  rows: [string, number, string][];
  /** значение, соответствующее 100% ширины полосы */
  max: number;
  suffix?: string;
  prefix?: string;
}

/** Карточка «Средний темп в месяц» — строки с прогресс-барами. */
export const PaceCard = ({ title, subtitle, rows, max, suffix = '%', prefix = '+' }: PaceCardProps) => (
  <div className="card p-4">
    <div className="text-xs font-bold text-slate-800">{title}</div>
    <p className="mt-0.5 text-[10px] text-slate-500">{subtitle}</p>
    <div className="mt-3 space-y-3">
      {rows.map(([name, value, color]) => (
        <div key={name}>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-600">{name}</span>
            <strong>{prefix}{fmt.format(value)}{suffix}</strong>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);
