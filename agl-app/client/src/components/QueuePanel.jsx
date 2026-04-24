import { useState, useEffect } from 'react';
import socket from '../socket';

export default function QueuePanel({ queues, userId }) {
  const [userTicket, setUserTicket] = useState(null);

  useEffect(() => {
    socket.on('ticket_assigned', (data) => setUserTicket(data));
    socket.on('ticket_removed', () => setUserTicket(null));
    socket.on('ticket_ready', () => setUserTicket(null));
    return () => {
      socket.off('ticket_assigned');
      socket.off('ticket_removed');
      socket.off('ticket_ready');
    };
  }, []);

  const handleToggle = (queueId) => {
    if (userTicket && userTicket.queueId === queueId) {
      socket.emit('leave_queue', { queueId, userId });
    } else if (!userTicket) {
      socket.emit('join_queue', { queueId, userId });
    }
  };

  const queueIcons = { food: '🍔', merch: '🛍️', rest_n: '🚻', rest_s: '🚻' };

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--palette-text-primary)' }}>
          Virtual Queues
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {queues.map((queue) => {
          const isJoined = userTicket && userTicket.queueId === queue.id;
          const isPaused = queue.status === 'paused';

          return (
            <div
              key={queue.id}
              className="card-outline"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderColor: isJoined ? 'var(--palette-text-primary)' : 'var(--palette-divider)',
                opacity: isPaused ? 0.6 : 1,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Joined indicator strip */}
              {isJoined && (
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, height: '4px', 
                  background: 'var(--palette-bg-primary-core)' 
                }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: isJoined ? '4px' : 0 }}>
                <span style={{ fontSize: '24px' }}>{queueIcons[queue.id]}</span>
                {isPaused && (
                  <span style={{
                    fontSize: '11px', fontWeight: 600, background: 'var(--palette-bg-subsurface)', 
                    padding: '2px 6px', borderRadius: '4px', color: 'var(--palette-text-link-disabled)'
                  }}>PAUSED</span>
                )}
              </div>

              <div style={{ fontWeight: 600, fontSize: '15px', lineHeight: 1.2 }}>
                {queue.name}
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginTop: 'auto' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--palette-bg-tertiary-hover)' }}>Wait</div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{queue.waitMin}<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--palette-bg-tertiary-hover)' }}>m</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--palette-bg-tertiary-hover)' }}>Queue</div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{queue.count}<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--palette-bg-tertiary-hover)' }}>p</span></div>
                </div>
              </div>

              {isJoined && (
                <div style={{ 
                  background: 'var(--palette-bg-subsurface)', padding: '6px', 
                  borderRadius: 'var(--radius-sm)', textAlign: 'center', 
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' 
                }}>
                  TICKET #{userTicket.ticketNumber}
                </div>
              )}

              <button
                onClick={() => handleToggle(queue.id)}
                disabled={isPaused || (userTicket && userTicket.queueId !== queue.id)}
                className={isJoined ? "btn-secondary" : "btn-primary"}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  opacity: (isPaused || (userTicket && userTicket.queueId !== queue.id)) ? 0.3 : 1,
                  cursor: (isPaused || (userTicket && userTicket.queueId !== queue.id)) ? 'not-allowed' : 'pointer'
                }}
              >
                {isJoined ? 'Leave' : 'Join'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
