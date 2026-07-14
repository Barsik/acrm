import { ChevronDown, LockKeyhole } from 'lucide-react';
import { PEER_GROUPS, PEER_GROUP_SIZES } from './rankingData';
import type { RankingAudience } from './rankingData';

interface PeerGroupBarProps {
  audience: RankingAudience;
  peerGroup: string;
  onPeerGroupChange: (group: string) => void;
}

export const PeerGroupBar = ({ audience, peerGroup, onPeerGroupChange }: PeerGroupBarProps) => (
  <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-5">
    <label className="border-b border-r border-slate-100 px-4 py-3 md:border-b-0">
      <span className="block text-[9px] uppercase tracking-wide text-slate-400">С кем сравниваем</span>
      <span className="relative mt-0.5 block">
        <select
          className="w-full appearance-none bg-transparent pr-5 text-[11px] font-bold text-slate-800 outline-none"
          value={peerGroup}
          onChange={e => onPeerGroupChange(e.target.value)}
        >
          {PEER_GROUPS.map(group => <option key={group}>{group}</option>)}
        </select>
        <ChevronDown size={11} className="pointer-events-none absolute right-0 top-0.5 text-slate-400" />
      </span>
      <small className="text-[9px] text-slate-400">{PEER_GROUP_SIZES[peerGroup] ?? 42} участников</small>
    </label>
    {([
      ['Минимальный порог', '50 клиентов'],
      ['Скрытые ячейки', '3'],
      ['Приватность', 'OK'],
      ['Данные', '2026-05'],
    ] as const).map(([label, value]) => (
      <div key={label} className="border-r border-slate-100 px-4 py-2.5 last:border-0">
        <div className="text-[10px] text-slate-400">{label}</div>
        <div className={`mt-0.5 text-xs font-bold ${value === 'OK' ? 'text-emerald-600' : 'text-slate-800'}`}>{value}</div>
      </div>
    ))}
    {audience === 'crm' && (
      <div className="col-span-2 flex items-center gap-1.5 border-t border-slate-100 bg-slate-50 px-4 py-2 text-[10px] text-slate-500 md:col-span-5">
        <LockKeyhole size={11} />
        Внутренний контур: доступна идентификация участников по правам CRM
      </div>
    )}
  </div>
);
