import { useMemo } from 'react';

export default function RoutingBanner({ zones }) {
  const recommendation = useMemo(() => {
    const entries = Object.entries(zones);
    if (entries.length === 0) return { zone: '...', wait: 0 };
    const [zone, value] = entries.reduce((a, b) => (a[1] < b[1] ? a : b));
    const waitMin = Math.max(1, Math.round(value / 10));
    return { zone: zone.charAt(0).toUpperCase() + zone.slice(1), wait: waitMin };
  }, [zones]);

  return (
    <div
      style={{
        background: 'var(--palette-bg-canvas)',
        border: '1px solid var(--palette-divider)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-lift)'
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--palette-bg-subsurface)',
        border: '1px solid var(--palette-divider)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--palette-text-primary)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2L12 22M12 2L6 8M12 2L18 8" />
        </svg>
      </div>

      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--palette-bg-tertiary-hover)', marginBottom: '4px' }}>
          Smart Route
        </div>
        <div style={{ fontSize: '15px', color: 'var(--palette-text-primary)', lineHeight: 1.3 }}>
          Enter via <span style={{ fontWeight: 600 }}>{recommendation.zone} Stand</span>
          {' '}· Wait: <span style={{ fontWeight: 600, color: 'var(--palette-bg-primary-core)' }}>{recommendation.wait}m</span>
        </div>
      </div>
    </div>
  );
}
