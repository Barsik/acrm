import { useState } from 'react';
import { ChartColumn } from 'lucide-react';
import { PeerGroupBar } from './PeerGroupBar';
import { RankingSection } from './RankingSection';
import { SegmentBuilderModal } from './SegmentBuilderModal';
import { DEFAULT_RANKING_FILTERS } from './rankingData';
import type { RankingAudience } from './rankingData';

interface CompanyRankingTabProps {
  companyName: string;
  audience?: RankingAudience;
}

export const CompanyRankingTab = ({ companyName, audience = 'crm' }: CompanyRankingTabProps) => {
  const [filters, setFilters] = useState(DEFAULT_RANKING_FILTERS);
  const [segmentOpen, setSegmentOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
        <ChartColumn size={15} />
        Рыночная и клиентская аналитика
      </div>
      <PeerGroupBar
        audience={audience}
        peerGroup={filters.peerGroup}
        onPeerGroupChange={peerGroup => setFilters({ ...filters, peerGroup })}
      />
      <RankingSection
        companyName={companyName}
        audience={audience}
        filters={filters}
        setFilters={setFilters}
        openSegment={() => setSegmentOpen(true)}
      />
      <SegmentBuilderModal
        open={segmentOpen}
        filters={filters}
        onClose={() => setSegmentOpen(false)}
        onApply={next => { setFilters(next); setSegmentOpen(false); }}
      />
    </div>
  );
};
