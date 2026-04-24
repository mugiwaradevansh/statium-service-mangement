import VenueHeatmap from './VenueHeatmap';
import RoutingBanner from './RoutingBanner';
import QueuePanel from './QueuePanel';
import MatchTicker from './MatchTicker';

export default function FanApp({ zones, queues, userId, matchData, addToast }) {
  // Format score for display
  const formatScore = () => {
    if (!matchData.scores || matchData.scores.length === 0) return null;
    return matchData.scores.map((s, i) => (
      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {i > 0 && <span style={{ color: 'var(--palette-divider)', margin: '0 4px' }}>|</span>}
        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--palette-text-primary)' }}>
          {s.runs}/{s.wickets}
        </span>
        <span style={{ color: 'var(--palette-bg-tertiary-hover)', fontSize: '13px' }}>
          ({s.overs} ov)
        </span>
      </span>
    ));
  };

  // Derive match title — use real team names if available
  const matchTitle = matchData.teams.length >= 2
    ? `${matchData.teams[0]} vs ${matchData.teams[1]}`
    : matchData.matchName || 'AGL Premier League';

  // Short team names for compact header
  const shortTitle = matchData.teams.length >= 2
    ? matchData.teams.map(t => t.split(' ').pop()).join(' vs ')
    : 'Premier League';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '480px',
        margin: '0 auto',
        background: 'var(--palette-bg-subsurface)',
        borderLeft: '1px solid var(--palette-divider)',
        borderRight: '1px solid var(--palette-divider)',
        boxShadow: 'var(--shadow-lift)',
      }}
    >
      {/* ─── HEADER (Clean, Airbnb-style) ─── */}
      <header
        style={{
          background: 'var(--palette-bg-canvas)',
          padding: '24px 24px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'rgba(0, 0, 0, 0.04) 0 2px 6px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-bg-tertiary-hover)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {matchData.venue ? matchData.venue.split(',')[0] : 'Google AGL'}
            </span>
            <h1 
              style={{ fontSize: '24px', fontWeight: 700, color: 'var(--palette-text-primary)', marginTop: '2px', lineHeight: 1.2 }}
              title={matchTitle}
            >
              {shortTitle}
            </h1>
          </div>

          {/* Live Indicator Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: matchData.isLive ? 'rgba(255, 56, 92, 0.08)' : 'var(--palette-bg-subsurface)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-pill)',
            border: `1px solid ${matchData.isLive ? 'rgba(255, 56, 92, 0.2)' : 'var(--palette-divider)'}`
          }}>
            {matchData.isLive && <div className="live-dot" />}
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 700, 
              color: matchData.isLive ? 'var(--palette-bg-primary-core)' : 'var(--palette-bg-tertiary-hover)',
              textTransform: 'uppercase' 
            }}>
              {matchData.isLive ? 'Live' : 'Recent'}
            </span>
          </div>
        </div>

        {/* Score & Status Area */}
        <div style={{ 
          marginTop: '12px', 
          background: 'var(--palette-bg-subsurface)', 
          borderRadius: 'var(--radius-md)', 
          padding: '12px 16px' 
        }}>
          {matchData.scores && matchData.scores.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {formatScore()}
              {matchData.overs && (
                <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: '500', color: 'var(--palette-bg-tertiary-hover)' }}>
                  Ov {matchData.overs}
                </span>
              )}
            </div>
          )}
          
          {matchData.status && matchData.status !== 'Connecting...' && (
            <div style={{ 
              fontSize: '14px', 
              color: matchData.isLive ? 'var(--palette-text-primary)' : 'var(--palette-bg-tertiary-hover)',
              fontWeight: 500
            }}>
              {matchData.status}
            </div>
          )}
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
        <VenueHeatmap zones={zones} />
        <RoutingBanner zones={zones} />
        <QueuePanel queues={queues} userId={userId} addToast={addToast} />
      </main>

      {/* ─── FIXED TICKER (Bottom) ─── */}
      <MatchTicker matchData={matchData} />
    </div>
  );
}
