import socket from '../socket';

export default function ZoneControls({ zones }) {
  const zoneList = [
    { key: 'north', label: 'North Stand' },
    { key: 'south', label: 'South Stand' },
    { key: 'east', label: 'East Stand' },
    { key: 'west', label: 'West Stand' },
  ];

  const getStatus = (value) => {
    if (value > 75) return { color: 'var(--palette-text-primary-error)', text: 'var(--palette-text-primary-error)', bg: '#fde9e7', label: 'High' };
    if (value >= 40) return { color: 'var(--palette-bg-primary-core)', text: 'var(--palette-bg-primary-core)', bg: '#fff0f2', label: 'Med' };
    return { color: 'var(--palette-divider)', text: 'var(--palette-bg-tertiary-hover)', bg: 'var(--palette-bg-subsurface)', label: 'Low' };
  };

  const handleSlider = (zone, value) => {
    socket.emit('update_density', { zone, value: parseInt(value) });
  };

  const handleSurge = () => {
    socket.emit('simulate_surge');
  };

  return (
    <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--palette-text-primary)' }}>
        Zone Density
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        {zoneList.map((zone) => {
          const value = zones[zone.key] || 0;
          const status = getStatus(value);

          return (
            <div key={zone.key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--palette-text-primary)' }}>
                  {zone.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: status.color === 'var(--palette-divider)' ? 'var(--palette-text-primary)' : status.text }}>
                    {value}%
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '4px 8px',
                    background: status.bg, color: status.text, borderRadius: 'var(--radius-sm)', textTransform: 'uppercase'
                  }}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Slider track */}
              <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'var(--palette-bg-subsurface)' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%', width: `${value}%`, borderRadius: '4px',
                  background: value > 75 ? 'var(--palette-text-primary-error)' : value >= 40 ? 'var(--palette-bg-primary-core)' : 'var(--palette-text-primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <input
                type="range"
                min="0" max="100"
                value={value}
                onChange={(e) => handleSlider(zone.key, e.target.value)}
                style={{
                  width: '100%', appearance: 'none', height: '8px', background: 'transparent', cursor: 'pointer',
                  position: 'relative', marginTop: '-12px', zIndex: 2
                }}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSurge}
        className="btn-secondary"
        style={{ width: '100%', padding: '14px', fontWeight: 600 }}
      >
        Simulate Surge
      </button>
    </div>
  );
}
