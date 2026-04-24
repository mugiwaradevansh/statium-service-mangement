import { useState } from 'react';
import socket from '../socket';

export default function QueueManager({ queues }) {
  const [feedback, setFeedback] = useState({});

  const flash = (queueId, type, duration = 800) => {
    setFeedback(prev => ({ ...prev, [queueId]: type }));
    setTimeout(() => setFeedback(prev => { const n = { ...prev }; delete n[queueId]; return n; }), duration);
  };

  const handleCallNext = (queueId) => {
    socket.emit('call_next', { queueId });
    flash(queueId, 'calling');
  };

  const handleToggle = (queueId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'paused' : 'open';
    socket.emit('toggle_queue', { queueId, status: newStatus });
    flash(queueId, 'toggling');
  };

  return (
    <div className="card-elevated" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--palette-text-primary)', marginBottom: '24px' }}>
        Service Queues
      </h2>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              {['Queue', 'Waiting', 'Wait Time', 'Status', 'Action'].map((h, i) => (
                <th key={h} style={{
                  padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--palette-bg-tertiary-hover)',
                  borderBottom: '1px solid var(--palette-divider)', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queues.map((queue) => {
              const isOpen = queue.status === 'open';
              const isCalling = feedback[queue.id] === 'calling';
              const isToggling = feedback[queue.id] === 'toggling';
              const canCall = queue.count > 0 && isOpen;

              return (
                <tr key={queue.id} style={{ 
                  borderBottom: '1px solid var(--palette-divider)',
                  background: isCalling ? '#f7f7f7' : 'transparent',
                  transition: 'background 0.3s'
                }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: 600, color: 'var(--palette-text-primary)' }}>
                    {queue.name}
                  </td>
                  <td style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                    {queue.count} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--palette-bg-tertiary-hover)' }}>ppl</span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: 500, color: 'var(--palette-text-primary)' }}>
                    {queue.waitMin} min
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => handleToggle(queue.id, queue.status)}
                      style={{
                        padding: '6px 12px', fontSize: '12px', fontWeight: 600, borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${isOpen ? 'var(--palette-divider)' : 'var(--palette-text-primary-error)'}`,
                        background: isOpen ? 'transparent' : '#fde9e7',
                        color: isOpen ? 'var(--palette-text-primary)' : 'var(--palette-text-primary-error)',
                        cursor: 'pointer', outline: 'none', transition: 'all 0.15s',
                        transform: isToggling ? 'scale(0.95)' : 'scale(1)'
                      }}
                    >
                      {isOpen ? 'Open' : 'Paused'}
                    </button>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      className={canCall && !isCalling ? "btn-primary" : "btn-secondary"}
                      onClick={() => canCall && handleCallNext(queue.id)}
                      disabled={!canCall}
                      style={{
                        padding: '8px 16px', fontSize: '13px', fontWeight: 600, width: '100px',
                        cursor: canCall ? 'pointer' : 'not-allowed',
                        opacity: canCall ? 1 : 0.4,
                      }}
                    >
                      {isCalling ? 'Called' : 'Call Next'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {queues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--palette-bg-tertiary-hover)' }}>
            No queues available
          </div>
        )}
      </div>
    </div>
  );
}
