export default function VenueHeatmap({ zones }) {
  const getColor = (value) => {
    if (value > 75) return { fill: 'var(--palette-bg-tertiary-core)', label: 'HIGH' }; // Deep Rausch for HIGH instead of error red
    if (value >= 40) return { fill: 'var(--palette-bg-primary-core)', label: 'MED' }; // Rausch for MED
    return { fill: 'grey', label: 'LOW' }; // Or simple grey, or green? Let's use Airbnb logic: maybe blue or gray
  };

  const getAirbnbColor = (value) => {
    if (value > 75) return { fill: 'var(--palette-bg-tertiary-core)', stroke: 'var(--palette-bg-tertiary-core)', label: 'High' };
    if (value >= 40) return { fill: 'var(--palette-bg-primary-core)', stroke: 'var(--palette-bg-primary-core)', label: 'Med' };
    return { fill: 'var(--palette-divider)', stroke: 'var(--palette-bg-tertiary-hover)', label: 'Low' }; // neutral gray for low
  };

  const zoneData = [
    { key: 'north', label: 'North', value: zones.north, cx: 200, cy: 60, rx: 80, ry: 30 },
    { key: 'south', label: 'South', value: zones.south, cx: 200, cy: 240, rx: 80, ry: 30 },
    { key: 'east', label: 'East', value: zones.east, cx: 340, cy: 150, rx: 30, ry: 70 },
    { key: 'west', label: 'West', value: zones.west, cx: 60, cy: 150, rx: 30, ry: 70 },
  ];

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--palette-text-primary)' }}>
          Venue Density
        </h2>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--palette-bg-tertiary-hover)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Real-Time
        </span>
      </div>

      <div className="card-outline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg
          viewBox="0 0 400 300"
          style={{ width: '100%', height: 'auto', maxHeight: '200px' }}
        >
          {/* Stadium outline */}
          <ellipse
            cx="200" cy="150" rx="180" ry="130"
            fill="none"
            stroke="var(--palette-divider)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Field */}
          <ellipse
            cx="200" cy="150" rx="100" ry="60"
            fill="none"
            stroke="var(--palette-bg-tertiary-hover)"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Zones */}
          {zoneData.map((zone) => {
            const color = getAirbnbColor(zone.value);
            return (
              <g key={zone.key}>
                {/* Zone shape */}
                <ellipse
                  cx={zone.cx} cy={zone.cy} rx={zone.rx - 4} ry={zone.ry - 4}
                  fill={color.fill}
                  opacity={zone.value > 75 ? "0.8" : zone.value >= 40 ? "0.6" : "0.2"}
                  stroke={color.stroke}
                  strokeWidth="1"
                />
                <text
                  x={zone.cx}
                  y={zone.cy - 4}
                  textAnchor="middle"
                  fill="var(--palette-text-primary)"
                  fontSize="12"
                  fontWeight="600"
                >
                  {zone.label}
                </text>
                <text
                  x={zone.cx}
                  y={zone.cy + 12}
                  textAnchor="middle"
                  fill="var(--palette-text-focused)"
                  fontSize="11"
                  fontWeight="500"
                >
                  {zone.value}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
          {[
            { color: 'var(--palette-divider)', label: 'Low' },
            { color: 'var(--palette-bg-primary-core)', label: 'Med' },
            { color: 'var(--palette-bg-tertiary-core)', label: 'High' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--palette-bg-tertiary-hover)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
