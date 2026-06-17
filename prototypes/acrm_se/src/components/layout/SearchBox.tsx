import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchService } from '../../services';

/**
 * Global client/holding/person/task search with a live results dropdown.
 * - `pill`  variant: collapsible 40px→200px puck, used inside the top nav pill.
 * - `bar`   variant: always-open fixed-width bar, used in the header (left-menu mode).
 */
export const SearchBox = ({ variant, width = 300 }: { variant: 'pill' | 'bar'; width?: number }) => {
  const navigate = useNavigate();
  const isBar = variant === 'bar';
  const [open, setOpen] = useState(isBar);
  const [val, setVal] = useState('');
  const [results, setResults] = useState<ReturnType<typeof searchService.search> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open && !isBar) inputRef.current?.focus(); }, [open, isBar]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setResults(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handle = (v: string) => { setVal(v); setResults(v.length >= 2 ? searchService.search(v) : null); };
  const go = (p: string) => { navigate(p); setResults(null); setVal(''); if (!isBar) setOpen(false); };
  const total = results ? results.holdings.length + results.companies.length + results.persons.length + results.tasks.length : 0;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div
        onClick={() => { if (!open) setOpen(true); }}
        style={{
          display: 'flex', alignItems: 'center', overflow: 'hidden',
          width: isBar ? width : (open ? 200 : 40), height: 40, borderRadius: 12,
          background: '#F0F2F5', transition: 'width 0.2s ease',
          cursor: open ? 'text' : 'pointer',
        }}
      >
        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AABB', flexShrink: 0 }}>
          <Search size={18} strokeWidth={1.8} />
        </div>
        <input
          ref={inputRef}
          value={val}
          onChange={e => handle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') { setVal(''); setResults(null); if (!isBar) setOpen(false); } }}
          onBlur={() => { if (!isBar) setTimeout(() => { if (!val) setOpen(false); }, 150); }}
          placeholder="Поиск по клиенту, ИНН…"
          style={{
            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13, color: '#1E2535', pointerEvents: open ? 'auto' : 'none',
          }}
        />
        {val && (
          <button
            onMouseDown={e => { e.preventDefault(); setVal(''); setResults(null); inputRef.current?.focus(); }}
            style={{ width: 30, height: 40, flexShrink: 0, border: 'none', background: 'transparent', color: '#A0AABB', cursor: 'pointer' }}
          ><X size={14} strokeWidth={2} /></button>
        )}
      </div>

      {results && (
        <div className="card" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: 340, minWidth: 300, maxHeight: 360, overflowY: 'auto', padding: 6, zIndex: 60 }}>
          {total === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: '#A0AABB', textAlign: 'center' }}>Ничего не найдено</div>
          ) : (
            <>
              <ResultGroup label="Холдинги" items={results.holdings.map(h => ({ id: h.id, title: h.name, sub: `${h.industry} · ${h.category}`, hex: '#E8001C', initial: h.shortName[0], onClick: () => go(`/holdings/${h.id}`) }))} />
              <ResultGroup label="Компании" items={results.companies.map(c => ({ id: c.id, title: c.name, sub: `ИНН: ${c.inn}`, hex: '#9B59B6', initial: c.name[0], onClick: () => go(`/companies/${c.id}`) }))} />
              <ResultGroup label="Персоны" items={results.persons.map(p => ({ id: p.id, title: p.fullName, sub: `${p.title}`, hex: '#12A05C', initial: p.firstName[0], onClick: () => go(`/persons/${p.id}`) }))} />
              <ResultGroup label="Задачи" items={results.tasks.map(t => ({ id: t.id, title: t.title, sub: `${t.entityName} · ${t.dueDate}`, hex: '#F5A623', initial: '•', onClick: () => go('/tasks') }))} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface ResultRow { id: string; title: string; sub: string; hex: string; initial: string; onClick: () => void }
const ResultGroup = ({ label, items }: { label: string; items: ResultRow[] }) => {
  if (items.length === 0) return null;
  return (
    <div>
      <div style={{ padding: '6px 10px 4px', fontSize: 10, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
      {items.map(it => (
        <button
          key={it.id}
          onClick={it.onClick}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F6F7FA'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${it.hex}18`, color: it.hex, fontSize: 12, fontWeight: 700 }}>{it.initial}</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E2535', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</span>
            <span style={{ display: 'block', fontSize: 11, color: '#A0AABB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.sub}</span>
          </span>
        </button>
      ))}
    </div>
  );
};
