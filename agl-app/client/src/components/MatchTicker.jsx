export default function MatchTicker({ matchData }) {
  const events = matchData?.events?.length > 0
    ? matchData.events
    : [
        { text: 'Waiting for live match data...', type: 'info' }
      ];

  const doubled = [...events, ...events];

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        background: 'var(--palette-bg-canvas)',
        borderTop: '1px solid var(--palette-divider)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '12px 0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
      }}
    >
      <div
        style={{
          position: 'absolute', left: 16, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center', zIndex: 10,
          background: 'linear-gradient(90deg, var(--palette-bg-canvas) 85%, transparent)',
          paddingRight: 16
        }}
      >
        <span
          style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: matchData?.isLive ? 'var(--palette-bg-primary-core)' : 'var(--palette-bg-tertiary-hover)',
            textTransform: 'uppercase'
          }}
        >
          {matchData?.isLive ? '● Live Updates' : '● Data'}
        </span>
      </div>

      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '32px',
          animation: `tickerScroll ${Math.max(12, events.length * 5)}s linear infinite`,
          width: 'max-content',
          paddingLeft: '110px'
        }}
      >
        {doubled.map((event, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', fontWeight: 500, color: 'var(--palette-text-primary)'
            }}
          >
            <span style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: event.type === 'wicket' ? 'var(--palette-text-primary-error)' : 'var(--palette-divider)'
            }} />
            {event.text}
          </span>
        ))}
      </div>
    </div>
  );
}
