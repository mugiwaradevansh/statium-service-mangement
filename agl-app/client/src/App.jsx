import { useState, useEffect, useCallback } from 'react';
import socket from './socket';
import FanApp from './components/FanApp';
import OpsDashboard from './components/OpsDashboard';

function App() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role') || 'fan';

  const [zones, setZones] = useState({ north: 0, south: 0, east: 0, west: 0 });
  const [queues, setQueues] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [matchData, setMatchData] = useState({
    isLive: false,
    matchName: 'Loading...',
    teams: [],
    scores: [],
    status: 'Connecting...',
    venue: '',
    matchType: '',
    events: [],
    overs: '',
    matchId: null
  });

  const [userId] = useState(() => {
    let id = sessionStorage.getItem('agl_user_id');
    if (!id) {
      id = 'fan_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('agl_user_id', id);
    }
    return id;
  });

  const addToast = useCallback((title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  useEffect(() => {
    socket.on('density_update', (data) => setZones(data.zones));
    socket.on('queue_update', (data) => setQueues(data.queues));
    socket.on('match_update', (data) => setMatchData(data));

    socket.on('ticket_ready', (data) => {
      addToast('Your turn!', `Your ${data.queueName} order is ready — ${data.station}`);
    });

    socket.on('incident', (entry) => {
      setIncidents(prev => [entry, ...prev].slice(0, 20));
    });

    socket.on('incident_log', (log) => {
      setIncidents(log);
    });

    return () => {
      socket.off('density_update');
      socket.off('queue_update');
      socket.off('match_update');
      socket.off('ticket_ready');
      socket.off('incident');
      socket.off('incident_log');
    };
  }, [addToast]);

  return (
    <>
      {role === 'ops' ? (
        <OpsDashboard
          zones={zones}
          queues={queues}
          incidents={incidents}
          matchData={matchData}
          addToast={addToast}
        />
      ) : (
        <FanApp
          zones={zones}
          queues={queues}
          userId={userId}
          matchData={matchData}
          addToast={addToast}
        />
      )}

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.exiting ? 'exiting' : ''}`}>
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
