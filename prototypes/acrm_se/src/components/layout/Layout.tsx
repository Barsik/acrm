import { type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useApp } from '../../context/AppContext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface LayoutProps {
  children: ReactNode;
  /** Accepted for backwards-compat but no longer rendered. */
  breadcrumbs?: BreadcrumbItem[];
  /** Set false for pages that own their full-bleed layout. */
  contained?: boolean;
}

/**
 * App shell (client-portal-front approach): a 62px AppHeader + a floating
 * centered SideNav pill, with full-width content below. No left rail.
 */
export const Layout = ({ children, contained = true }: LayoutProps) => {
  const { role, menuPosition } = useApp();

  if (!role) return <>{children}</>;

  // When the menu is a left floating pill, reserve only the pill's strip and let
  // the work area stretch across all remaining width (no centered max-width cap).
  // < lg левая пилюля скрыта (меню становится горизонтальным) — отступ не нужен;
  // < md горизонтальная пилюля опускается под шапку — контенту нужен просвет сверху.
  const leftMode = menuPosition === 'left';

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7FA' }}>
      <Header />
      <Sidebar />
      <main className={`${leftMode ? 'lg:pl-[220px]' : ''} max-md:pt-[64px]`}>
        {contained ? (
          <div className="pt-5 pb-10 px-8 max-sm:px-4" style={{ maxWidth: leftMode ? 'none' : 1600, margin: leftMode ? 0 : '0 auto' }}>
            {children}
          </div>
        ) : children}
      </main>
    </div>
  );
};
