import { Layout } from '../components/layout/Layout';
import { PageTitle } from '../components/common';
import { useApp, type MenuPosition } from '../context/AppContext';
import { SlidersHorizontal, Check } from 'lucide-react';

interface OptionDef {
  id: MenuPosition;
  title: string;
  desc: string;
  preview: 'top' | 'left';
}

const OPTIONS: OptionDef[] = [
  { id: 'top', title: 'Сверху', desc: 'Плавающее меню по центру сверху — компактные иконки (текущее).', preview: 'top' },
  { id: 'left', title: 'Слева по центру', desc: 'Вертикальное плавающее меню слева — иконки с подписями.', preview: 'left' },
];

/** Mini schematic of the chrome for each menu position. */
const MenuPreview = ({ kind, accent }: { kind: 'top' | 'left'; accent: string }) => (
  <div style={{ position: 'relative', height: 96, borderRadius: 10, background: '#F6F7FA', border: '1px solid #E8EBF0', overflow: 'hidden' }}>
    {/* header dot (logo) */}
    <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 6, borderRadius: 99, background: '#D0D4DC' }} />
    {/* action pill */}
    <div style={{ position: 'absolute', top: 7, right: 8, width: 26, height: 9, borderRadius: 99, background: '#fff', border: '1px solid #E8EBF0' }} />
    {kind === 'top' ? (
      <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, padding: 3, borderRadius: 8, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
        {[0, 1, 2, 3, 4].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: 3, background: i === 0 ? accent : '#E2E5EA' }} />)}
      </div>
    ) : (
      <div style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 4, padding: 5, borderRadius: 8, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 3, background: i === 0 ? accent : '#E2E5EA' }} />
            <span style={{ width: 28, height: 5, borderRadius: 99, background: i === 0 ? accent : '#E8EBF0' }} />
          </span>
        ))}
      </div>
    )}
    {/* content blocks */}
    <div style={{ position: 'absolute', bottom: 10, right: 10, left: kind === 'left' ? 64 : 10, display: 'flex', gap: 6 }}>
      <span style={{ flex: 1, height: 22, borderRadius: 6, background: '#fff', border: '1px solid #E8EBF0' }} />
      <span style={{ flex: 1, height: 22, borderRadius: 6, background: '#fff', border: '1px solid #E8EBF0' }} />
    </div>
  </div>
);

export const SettingsPage = () => {
  const { menuPosition, setMenuPosition } = useApp();

  return (
    <Layout breadcrumbs={[{ label: 'Настройки' }]}>
      <PageTitle
        icon={<SlidersHorizontal size={22} />}
        accent="#5A6478"
        title="Настройки"
        subtitle="Параметры интерфейса"
      />

      <div className="card" style={{ padding: 24, maxWidth: 760 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1E2535' }}>Положение меню</div>
        <div style={{ fontSize: 13, color: '#5A6478', margin: '4px 0 18px' }}>
          Где показывать навигационное меню приложения.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {OPTIONS.map(opt => {
            const selected = menuPosition === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setMenuPosition(opt.id)}
                style={{
                  textAlign: 'left', cursor: 'pointer', padding: 14, borderRadius: 14,
                  background: selected ? 'rgba(232,0,28,0.03)' : '#fff',
                  border: `1.5px solid ${selected ? '#E8001C' : '#E8EBF0'}`,
                  transition: 'border-color 0.16s, background 0.16s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#C0C8D4'; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#E8EBF0'; }}
              >
                <MenuPreview kind={opt.preview} accent="#E8001C" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E2535' }}>{opt.title}</span>
                  {selected && (
                    <span style={{
                      marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#E8001C',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={13} color="#fff" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#5A6478', marginTop: 4, lineHeight: 1.45 }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};
