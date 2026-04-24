import { useState, useEffect } from 'react';
import ZoneControls from './ZoneControls';
import QueueManager from './QueueManager';
import IncidentLog from './IncidentLog';

export default function OpsDashboard({ zones, queues, incidents, matchData, addToast }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const matchTitle = matchData?.teams?.length >= 2
    ? `${matchData.teams[0]} vs ${matchData.teams[1]}`
    : matchData?.matchName || 'AGL Premier League';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--palette-bg-subsurface)',
        minWidth: '900px'
      }}
    >
      {/* ─── HEADER ─── */}
      <header
        style={{
          background: 'var(--palette-bg-canvas)',
          borderBottom: '1px solid var(--palette-divider)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          boxShadow: 'rgba(0, 0, 0, 0.04) 0 2px 6px 0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)',
            background: 'var(--palette-bg-primary-core)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em'
          }}>
            OPS
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--palette-text-primary)' }}>
              AGL Operations
            </h1>
            <span style={{ fontSize: '13px', color: 'var(--palette-bg-tertiary-hover)' }}>
              Event Command Center
            </span>
          </div>
        </div>

        {/* Center: Match Info */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'var(--palette-bg-subsurface)', padding: '8px 16px',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--palette-divider)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--palette-text-primary)' }}>
            🏏 {matchTitle}
          </div>
          {matchData?.scores?.length > 0 && (
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--palette-bg-tertiary-hover)', marginTop: '4px' }}>
              {matchData.scores.map((s, i) => (
                <span key={i}>
                  {i > 0 && ' | '}
                  {s.runs}/{s.wickets} ({s.overs} ov)
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(34, 34, 34, 0.05)', padding: '8px 16px',
            borderRadius: 'var(--radius-pill)', border: '1px solid var(--palette-divider)'
          }}>
            <div className="live-dot" style={{ background: 'var(--palette-bg-primary-core)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--palette-text-primary)' }}>
              Live Event
            </span>
          </div>

          <div style={{
            fontSize: '16px', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
            color: 'var(--palette-text-primary)', padding: '8px 16px',
            background: 'var(--palette-bg-canvas)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--palette-divider)'
          }}>
            {clock}
          </div>
        </div>
      </header>

      {/* ─── MAIN PANELS ─── */}
      <div style={{ display: 'flex', flex: 1, gap: '24px', padding: '32px', minHeight: 0 }}>
        <div style={{ width: '400px', flexShrink: 0 }}>
          <ZoneControls zones={zones} />
        </div>
        <div style={{ flex: 1 }}>
          <QueueManager queues={queues} addToast={addToast} />
        </div>
      </div>

      {/* ─── INCIDENT LOG ─── */}
      <div style={{ padding: '0 32px 32px' }}>
        <IncidentLog incidents={incidents} />
      </div>
    </div>
  );
}
