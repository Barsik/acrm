import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SeverityBadge, StatusBadge, PageTitle } from '../components/common';
import { alertsService } from '../services';
import { AlertTriangle, AlertCircle, Info, CheckSquare, ChevronRight } from 'lucide-react';

const SEV: Record<string, { accent: string; Icon: typeof AlertTriangle }> = {
  critical: { accent: '#E8001C', Icon: AlertCircle },
  high: { accent: '#F5A623', Icon: AlertTriangle },
  medium: { accent: '#4A90D9', Icon: Info },
};

export const AlertsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const all = alertsService.getAll();
  const displayed = filter === 'all' ? all : all.filter(a => a.severity === filter);

  const openEntity = (a: { entityType: string; entityId: string }) =>
    navigate(a.entityType === 'holding' ? `/holdings/${a.entityId}` : `/companies/${a.entityId}`);

  return (
    <Layout breadcrumbs={[{ label: 'Алерты' }]}>
      <PageTitle
        icon={<AlertTriangle size={22} />}
        accent="#E8001C"
        title="Алерты и риски"
        subtitle="Все активные алерты по портфелю · 09.06.2026"
      />

      {/* Stats — click a tile to filter */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {([
          { key: 'all', label: 'Всего алертов', count: all.length, accent: '#5A6478' },
          { key: 'critical', label: 'Критичных', count: all.filter(a => a.severity === 'critical').length, accent: '#E8001C' },
          { key: 'high', label: 'Высоких', count: all.filter(a => a.severity === 'high').length, accent: '#F5A623' },
          { key: 'medium', label: 'Средних', count: all.filter(a => a.severity === 'medium').length, accent: '#4A90D9' },
        ] as const).map(s => {
          const active = filter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className="card"
              style={{
                textAlign: 'left', cursor: 'pointer', padding: '16px 18px',
                borderColor: active ? s.accent : '#E8EBF0',
                background: active ? `${s.accent}0A` : '#fff',
                boxShadow: active ? `0 4px 16px ${s.accent}1F` : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = '#C0C8D4'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#E8EBF0'; }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.count}</div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {displayed.map(a => {
          const sev = SEV[a.severity] ?? SEV.medium;
          const Icon = sev.Icon;
          return (
            <div
              key={a.id}
              className="card"
              style={{ borderLeft: `4px solid ${sev.accent}`, borderRadius: '4px 16px 16px 4px', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                  <span style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${sev.accent}14`, color: sev.accent,
                  }}>
                    <Icon size={18} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E2535', margin: 0 }}>{a.title}</h3>
                      <SeverityBadge severity={a.severity} />
                    </div>
                    <button
                      onClick={() => openEntity(a)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3, padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5A6478', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#E8001C')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#5A6478')}
                    >
                      {a.entityName} <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <p style={{ fontSize: 13, color: '#3A4255', lineHeight: 1.5, margin: '0 0 12px' }}>{a.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 12, color: '#A0AABB', marginBottom: 12 }}>
                <div><span style={{ fontWeight: 700, color: '#5A6478' }}>Источник:</span> {a.source}</div>
                <div><span style={{ fontWeight: 700, color: '#5A6478' }}>Дата:</span> {a.date}</div>
                <div><span style={{ fontWeight: 700, color: '#5A6478' }}>Ответственный:</span> {a.responsibleName}</div>
              </div>

              <div style={{ padding: '10px 14px', background: '#F6F7FA', border: '1px solid #E8EBF0', borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5A6478', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Рекомендуемое действие</div>
                <div style={{ fontSize: 13, color: '#3A4255' }}>{a.recommendedAction}</div>
              </div>

              <div className="flex gap-2">
                <button className="btn-primary text-xs"><CheckSquare size={13} /> Взять в работу</button>
                <button className="btn-secondary text-xs">Передать</button>
                <button className="btn-secondary text-xs">Закрыть</button>
                <button className="btn-secondary text-xs ml-auto" onClick={() => openEntity(a)}>
                  Открыть {a.entityType === 'holding' ? 'холдинг' : 'компанию'} →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};
