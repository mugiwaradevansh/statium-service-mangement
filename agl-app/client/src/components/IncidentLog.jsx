import { useState } from 'react';
import socket from '../socket';

export default function IncidentLog({ incidents }) {
  const [showModal, setShowModal] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (inputText.trim()) {
      socket.emit('log_incident', { message: inputText.trim() });
      setInputText('');
      setShowModal(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setShowModal(false);
  };

  const getLogStyle = (msg) => {
    if (msg.includes('⚠')) return { color: 'var(--palette-bg-primary-core)' };
    if (msg.includes('✓')) return { color: 'var(--palette-text-primary)' };
    if (msg.includes('⚡')) return { color: 'var(--palette-text-primary-error)' };
    return { color: 'var(--palette-bg-tertiary-hover)' };
  };

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '--:--:--';
    }
  };

  return (
    <>
      <div className="card-elevated">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--palette-text-primary)' }}>
            Incident Log
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn-secondary"
            style={{ fontWeight: 600 }}
          >
            + Log Incident
          </button>
        </div>

        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {incidents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--palette-bg-tertiary-hover)' }}>
              No incidents logged yet
            </div>
          ) : (
            incidents.map((entry, i) => {
              const style = getLogStyle(entry.message);
              return (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px 16px',
                  background: i === 0 ? 'var(--palette-bg-subsurface)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  animation: i === 0 ? 'fadeInUp 0.3s ease' : 'none'
                }}>
                  <span style={{ 
                    fontSize: '12px', fontWeight: 600, color: 'var(--palette-bg-tertiary-hover)',
                    fontVariantNumeric: 'tabular-nums', marginTop: '2px', flexShrink: 0 
                  }}>
                    {formatTime(entry.timestamp)}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: style.color, lineHeight: 1.4 }}>
                    {entry.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--palette-text-primary)', marginBottom: '24px' }}>
              Log Incident
            </h3>
            <input
              type="text"
              placeholder="Enter incident description..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                width: '100%', padding: '14px 16px', border: '1px solid var(--palette-divider)',
                borderRadius: 'var(--radius-sm)', fontSize: '16px', fontWeight: 500, color: 'var(--palette-text-primary)',
                background: 'var(--palette-bg-canvas)'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: '12px 20px', fontSize: '15px' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn-primary" style={{ padding: '12px 20px', fontSize: '15px' }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
