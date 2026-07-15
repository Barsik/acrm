import { type ReactNode, type CSSProperties } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { formatPercent } from '../../data/mockData';

/*
 * Shared UI primitives — reworked to the client-portal-front design approach:
 * inline `style={{}}` objects with literal MOEX hex values (see
 * .claude/references/moex-design-system.md). Public prop signatures are kept
 * stable so every page keeps working without edits.
 */

// ---- MOEX tokens (module-internal; pages use the components below) ----
const MOEX = {
  red: '#E8001C',
  redHover: '#C40018',
  bg: '#F6F7FA',
  surface: '#FFFFFF',
  border: '#E8EBF0',
  text: '#1E2535',
  text2: '#5A6478',
  text3: '#3A4255',
  muted: '#A0AABB',
  pos: '#12A05C',
  warn: '#F5A623',
  warnText: '#B07800',
  info: '#4A90D9',
  infoText: '#1565C0',
  chip: '#F0F2F5',
} as const;

// Reusable inline card style (matches the `.card` CSS utility).
const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1.5px solid #E8EBF0',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: MOEX.text,
  letterSpacing: 0.1,
};

// ---- Card ----
export const Card = ({ children, style, padding = 20, onClick, className }: {
  children: ReactNode; style?: CSSProperties; padding?: number | string; onClick?: () => void; className?: string;
}) => (
  <div className={className} onClick={onClick} style={{ ...cardStyle, padding, ...style }}>
    {children}
  </div>
);

// ---- Page title (clean reference-style dashboard header) ----
export const PageTitle = ({ icon, accent = MOEX.red, title, subtitle, actions }: {
  icon?: ReactNode; accent?: string; title: string; subtitle?: string; actions?: ReactNode;
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginBottom: 24 }}>
    {icon && (
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${accent}14`, color: accent,
        border: `1.5px solid ${accent}26`,
      }}>
        {icon}
      </div>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: MOEX.text, lineHeight: 1.15, margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: MOEX.text2, margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>{actions}</div>}
  </div>
);

// ---- KPI Card ----
interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  change?: { current: number; prev: number };
  icon?: ReactNode;
  accent?: 'blue' | 'violet' | 'green' | 'red' | 'amber';
  onClick?: () => void;
}

const ACCENT_HEX: Record<NonNullable<KPICardProps['accent']>, string> = {
  blue: MOEX.red, // primary accent == red
  violet: '#9B59B6',
  green: MOEX.pos,
  red: MOEX.red,
  amber: MOEX.warn,
};

export const KPICard = ({ label, value, sub, change, icon, accent = 'blue', onClick }: KPICardProps) => {
  const hex = ACCENT_HEX[accent];
  const trend = change ? change.current - change.prev : 0;
  const pct = change ? formatPercent(change.current, change.prev) : null;
  const trendColor = trend > 0 ? MOEX.pos : trend < 0 ? MOEX.red : MOEX.muted;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div
      onClick={onClick}
      style={{
        ...cardStyle,
        borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.16s, box-shadow 0.16s, transform 0.16s',
        minWidth: 0,
      }}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.borderColor = MOEX.red;
        e.currentTarget.style.boxShadow = '0 8px 22px rgba(232,0,28,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.borderColor = MOEX.border;
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'none';
      } : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MOEX.muted, textTransform: 'uppercase', letterSpacing: 0.7, lineHeight: 1.3 }}>{label}</span>
        {icon && (
          <span style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${hex}14`, color: hex,
          }}>{icon}</span>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: MOEX.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: MOEX.muted, marginTop: 3 }}>{sub}</div>}
      {pct && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, fontWeight: 700, color: trendColor }}>
          <TrendIcon size={12} />
          <span>{pct} к прошлому году</span>
        </div>
      )}
    </div>
  );
};

// ---- Score Badge ----
interface ScoreBadgeProps {
  score: number;
  type: 'health' | 'risk' | 'growth';
  size?: 'sm' | 'md';
  /** Show the "Health/Risk/Growth" prefix. Off in table cells where the column header already names it. */
  showLabel?: boolean;
}

export const ScoreBadge = ({ score, type, size = 'md', showLabel = true }: ScoreBadgeProps) => {
  const tier = (() => {
    if (type === 'risk') {
      if (score >= 60) return { bg: '#FDE7EA', fg: MOEX.red };
      if (score >= 30) return { bg: '#FEF3E2', fg: MOEX.warnText };
      return { bg: 'rgba(18,160,92,0.10)', fg: MOEX.pos };
    }
    if (score >= 80) return { bg: 'rgba(18,160,92,0.10)', fg: MOEX.pos };
    if (score >= 50) return { bg: '#FEF3E2', fg: MOEX.warnText };
    return { bg: '#FDE7EA', fg: MOEX.red };
  })();
  const label = type === 'health' ? 'Health' : type === 'risk' ? 'Risk' : 'Growth';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: size === 'sm' ? 11 : 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
      padding: size === 'sm' ? '2px 8px' : '4px 10px', borderRadius: 99,
      background: tier.bg, color: tier.fg,
    }}>
      {showLabel ? `${label} ${score}` : score}
    </span>
  );
};

// ---- Alert Severity Badge ----
const SEVERITY: Record<string, { bg: string; fg: string; label: string }> = {
  critical: { bg: MOEX.red, fg: '#fff', label: 'Критично' },
  high: { bg: MOEX.warn, fg: '#fff', label: 'Высокий' },
  medium: { bg: MOEX.info, fg: '#fff', label: 'Средний' },
  low: { bg: MOEX.muted, fg: '#fff', label: 'Низкий' },
};

export const SeverityBadge = ({ severity }: { severity: string }) => {
  const s = SEVERITY[severity] || { bg: '#E8EBF0', fg: MOEX.text2, label: severity };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.fg, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

// ---- Status Badge ----
const STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  active: { bg: 'rgba(18,160,92,0.10)', fg: MOEX.pos, label: 'Активен' },
  declining: { bg: '#FEF3E2', fg: MOEX.warnText, label: 'Снижение' },
  inactive: { bg: '#FDE7EA', fg: MOEX.red, label: 'Неактивен' },
  new: { bg: '#EBF4FC', fg: MOEX.infoText, label: 'Новый' },
  churned: { bg: MOEX.chip, fg: MOEX.text2, label: 'Отток' },
  in_progress: { bg: '#EBF4FC', fg: MOEX.infoText, label: 'В работе' },
  done: { bg: 'rgba(18,160,92,0.10)', fg: MOEX.pos, label: 'Выполнено' },
  open: { bg: '#FEF3E2', fg: MOEX.warnText, label: 'Открыта' },
  overdue: { bg: '#FDE7EA', fg: MOEX.red, label: 'Просрочена' },
  on_track: { bg: 'rgba(18,160,92,0.10)', fg: MOEX.pos, label: 'В плане' },
  at_risk: { bg: '#FEF3E2', fg: MOEX.warnText, label: 'Под риском' },
  behind: { bg: '#FDE7EA', fg: MOEX.red, label: 'Отставание' },
  achieved: { bg: 'rgba(18,160,92,0.10)', fg: MOEX.pos, label: 'Выполнено' },
  expiring: { bg: '#FEF3E2', fg: MOEX.warnText, label: 'Истекает' },
  expired: { bg: '#FDE7EA', fg: MOEX.red, label: 'Истёк' },
};

// Статусы задач: Новая — синий, В работе — зелёный, Просроченная — красный
const TASK_STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  open: { bg: '#EBF4FC', fg: MOEX.infoText, label: 'Новая' },
  in_progress: { bg: 'rgba(18,160,92,0.10)', fg: MOEX.pos, label: 'В работе' },
  overdue: { bg: '#FDE7EA', fg: MOEX.red, label: 'Просроченная' },
  done: { bg: MOEX.chip, fg: MOEX.text2, label: 'Выполнена' },
};

export const TaskStatusBadge = ({ status }: { status: string }) => {
  const s = TASK_STATUS[status] || { bg: MOEX.chip, fg: MOEX.text2, label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.fg, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

// Статусы алертов — аналогично задачам: Новый — синий, В работе — зелёный, Закрыт — серый
const ALERT_STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  new: { bg: '#EBF4FC', fg: MOEX.infoText, label: 'Новый' },
  in_progress: { bg: 'rgba(18,160,92,0.10)', fg: MOEX.pos, label: 'В работе' },
  resolved: { bg: MOEX.chip, fg: MOEX.text2, label: 'Закрыт' },
};

export const AlertStatusBadge = ({ status }: { status: string }) => {
  const s = ALERT_STATUS[status] || { bg: MOEX.chip, fg: MOEX.text2, label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.fg, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS[status] || { bg: MOEX.chip, fg: MOEX.text2, label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.fg, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

// ---- Alert Item ----
interface AlertItemProps {
  title: string;
  description: string;
  severity: string;
  date: string;
  action?: string;
  onAction?: () => void;
}

const ALERT_TIER: Record<string, { border: string; bg: string; icon: string }> = {
  critical: { border: MOEX.red, bg: 'rgba(232,0,28,0.05)', icon: MOEX.red },
  high: { border: MOEX.warn, bg: 'rgba(247,183,49,0.08)', icon: MOEX.warn },
  medium: { border: MOEX.info, bg: '#EBF4FC', icon: MOEX.info },
  low: { border: '#C0C8D4', bg: MOEX.bg, icon: MOEX.muted },
};

export const AlertItem = ({ title, description, severity, date, action, onAction }: AlertItemProps) => {
  const tier = ALERT_TIER[severity] || ALERT_TIER.low;
  const IconComp = severity === 'critical' ? AlertCircle : severity === 'high' ? AlertTriangle : Info;

  return (
    <div style={{
      padding: 12, borderRadius: 10, marginBottom: 8,
      borderLeft: `4px solid ${tier.border}`, background: tier.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <IconComp size={16} style={{ marginTop: 2, flexShrink: 0, color: tier.icon }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: MOEX.text }}>{title}</span>
            <SeverityBadge severity={severity} />
          </div>
          <p style={{ fontSize: 12, color: MOEX.text2, margin: 0 }}>{description}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: MOEX.muted }}>{date}</span>
            {action && onAction && (
              <button onClick={onAction} style={{ fontSize: 12, fontWeight: 700, color: MOEX.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {action} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Progress Bar ----
const PROGRESS_HEX: Record<string, string> = {
  blue: MOEX.red, green: MOEX.pos, red: MOEX.red, amber: MOEX.warn, violet: '#9B59B6',
};

export const ProgressBar = ({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: '100%', background: '#EEF2F7', borderRadius: 99, height: 6 }}>
      <div style={{ height: 6, borderRadius: 99, width: `${pct}%`, background: PROGRESS_HEX[color] || MOEX.red, transition: 'width 0.3s' }} />
    </div>
  );
};

// ---- Section Header ----
export const SectionHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
    <div>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: MOEX.muted, margin: '3px 0 0' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
  </div>
);

// ---- Empty State ----
export const EmptyState = ({ title, description }: { title: string; description?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', textAlign: 'center' }}>
    <div style={{ width: 48, height: 48, borderRadius: '50%', background: MOEX.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Info size={20} style={{ color: MOEX.muted }} />
    </div>
    <p style={{ fontSize: 13, fontWeight: 700, color: MOEX.text2, margin: 0 }}>{title}</p>
    {description && <p style={{ fontSize: 12, color: MOEX.muted, margin: '4px 0 0' }}>{description}</p>}
  </div>
);

// ---- AI Insight Card ----
const AI_TIER: Record<string, { bg: string; border: string; fg: string }> = {
  summary: { bg: '#EBF4FC', border: '#CFE3F8', fg: MOEX.infoText },
  opportunity: { bg: 'rgba(18,160,92,0.06)', border: '#B0E6CC', fg: MOEX.pos },
  risk: { bg: 'rgba(232,0,28,0.05)', border: '#F8CDD2', fg: MOEX.red },
  next_action: { bg: 'rgba(155,89,182,0.07)', border: '#DCC0E8', fg: '#7A3B93' },
  cross_sell: { bg: 'rgba(247,183,49,0.08)', border: '#FCE3B5', fg: MOEX.warnText },
};

const AI_LABELS: Record<string, string> = {
  summary: 'Сводка', opportunity: 'Возможность', risk: 'Риск',
  next_action: 'Рекомендация', cross_sell: 'Cross-sell', meeting_brief: 'Brief к встрече',
};

export const AIInsightCard = ({ title, body, confidence, type }: { title: string; body: string; confidence: number; type: string }) => {
  const tier = AI_TIER[type] || { bg: MOEX.bg, border: MOEX.border, fg: MOEX.text2 };
  return (
    <div style={{ padding: 14, borderRadius: 12, background: tier.bg, border: `1px solid ${tier.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MOEX.red, textTransform: 'uppercase', letterSpacing: 0.5 }}>AI · {AI_LABELS[type] || type}</span>
        <span style={{ fontSize: 11, color: MOEX.muted, marginLeft: 'auto' }}>Уверенность: {confidence}%</span>
      </div>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: MOEX.text, margin: '0 0 4px' }}>{title}</h4>
      <p style={{ fontSize: 12, color: MOEX.text3, whiteSpace: 'pre-line', lineHeight: 1.5, margin: 0 }}>{body}</p>
    </div>
  );
};

// ---- Trend Arrow ----
export const TrendArrow = ({ current, prev }: { current: number; prev: number }) => {
  const diff = prev === 0 ? 0 : ((current - prev) / prev) * 100;
  if (Math.abs(diff) < 0.5) return <span style={{ color: MOEX.muted, fontSize: 12 }}>—</span>;
  const positive = diff > 0;
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: positive ? MOEX.pos : MOEX.red, fontVariantNumeric: 'tabular-nums' }}>
      {positive ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}%
    </span>
  );
};
