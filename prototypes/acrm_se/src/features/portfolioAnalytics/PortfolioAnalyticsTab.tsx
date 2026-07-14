import { useState } from 'react';
import { PeerGroupBar } from '../ranking/PeerGroupBar';
import { SegmentBuilderModal } from '../ranking/SegmentBuilderModal';
import { DEFAULT_RANKING_FILTERS } from '../ranking/rankingData';
import type { RankingAudience } from '../ranking/rankingData';
import { PortfolioStructure } from './PortfolioStructure';
import { PortfolioDynamics } from './PortfolioDynamics';
import { ExternalPortfolio } from './ExternalPortfolio';
import type { MatrixMetric, MatrixSelection } from './analyticsData';

type AnalyticsView = 'structure' | 'dynamics' | 'external';

const VIEWS: [AnalyticsView, string, string, string][] = [
  ['structure', '01', 'Структура портфеля', 'Поведение и AuC-сегменты'],
  ['dynamics', '02', 'Динамика портфеля', 'Клиентский цикл во времени'],
  ['external', '03', 'Внешний портфель', 'Активность клиентов у других брокеров'],
];

interface PortfolioAnalyticsTabProps {
  companyName: string;
  audience?: RankingAudience;
}

export const PortfolioAnalyticsTab = ({ companyName, audience = 'crm' }: PortfolioAnalyticsTabProps) => {
  const [filters, setFilters] = useState(DEFAULT_RANKING_FILTERS);
  const [segmentOpen, setSegmentOpen] = useState(false);
  const [view, setView] = useState<AnalyticsView>('structure');
  const [selection, setSelection] = useState<MatrixSelection>({ type: 'cell', row: 2, col: 3 });
  const [matrixMetric, setMatrixMetric] = useState<MatrixMetric>('clients');
  const [extMetric, setExtMetric] = useState<MatrixMetric>('auc');
  const [extMode, setExtMode] = useState<'share' | 'absolute'>('absolute');
  const [coverageView, setCoverageView] = useState<'markets' | 'products'>('markets');
  const [coverageName, setCoverageName] = useState('Срочный рынок');

  return (
    <div className="space-y-4">
      <PeerGroupBar
        audience={audience}
        peerGroup={filters.peerGroup}
        onPeerGroupChange={peerGroup => setFilters({ ...filters, peerGroup })}
      />

      <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 md:grid-cols-3">
        {VIEWS.map(([key, num, title, sub]) => (
          <button
            key={key}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
              view === key ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/70'
            }`}
            onClick={() => setView(key)}
          >
            <span className={`text-xs font-bold ${view === key ? 'text-blue-600' : 'text-slate-400'}`}>{num}</span>
            <span>
              <strong className="block text-sm text-slate-900">{title}</strong>
              <small className="text-[10px] text-slate-500">{sub}</small>
            </span>
          </button>
        ))}
      </div>

      {view === 'dynamics' && (
        <PortfolioDynamics
          ownName={companyName}
          filters={filters}
          setFilters={setFilters}
          openSegment={() => setSegmentOpen(true)}
        />
      )}
      {view === 'structure' && (
        <PortfolioStructure
          filters={filters}
          setFilters={setFilters}
          openSegment={() => setSegmentOpen(true)}
          metric={matrixMetric}
          setMetric={setMatrixMetric}
          selection={selection}
          setSelection={setSelection}
          goToDynamics={() => setView('dynamics')}
          goToExternal={() => setView('external')}
        />
      )}
      {view === 'external' && (
        <ExternalPortfolio
          ownName={companyName}
          filters={filters}
          setFilters={setFilters}
          openSegment={() => setSegmentOpen(true)}
          selection={selection}
          extMetric={extMetric}
          setExtMetric={setExtMetric}
          extMode={extMode}
          setExtMode={setExtMode}
          coverageView={coverageView}
          setCoverageView={setCoverageView}
          coverageName={coverageName}
          setCoverageName={setCoverageName}
        />
      )}

      <SegmentBuilderModal
        open={segmentOpen}
        filters={filters}
        onClose={() => setSegmentOpen(false)}
        onApply={next => { setFilters(next); setSegmentOpen(false); }}
      />
    </div>
  );
};
