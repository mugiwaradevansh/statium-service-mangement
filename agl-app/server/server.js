const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ─── CRICKET DATA SERVICE ───────────────────────────────────

const CRICKET_API_KEY = process.env.CRICKET_API_KEY || '';
const CRICKET_API_BASE = 'https://api.cricapi.com/v1';

let matchCache = {
  data: null,
  timestamp: 0,
  ttl: 120000 // 2 minute cache to stay under 100 hits/day
};

let scorecardCache = {
  data: null,
  matchId: null,
  timestamp: 0,
  ttl: 120000
};

// Current match data that gets broadcast
let currentMatchData = {
  isLive: false,
  matchName: 'IPL 2026',
  teams: [],
  scores: [],
  status: 'Waiting for live match...',
  venue: '',
  matchType: '',
  events: [],
  overs: '',
  matchId: null
};

async function fetchCurrentMatches() {
  if (!CRICKET_API_KEY) {
    console.log('⚠ No CRICKET_API_KEY set — using fallback data');
    return null;
  }

  const now = Date.now();
  if (matchCache.data && (now - matchCache.timestamp) < matchCache.ttl) {
    return matchCache.data;
  }

  try {
    const url = `${CRICKET_API_BASE}/currentMatches?apikey=${CRICKET_API_KEY}&offset=0`;
    console.log('🏏 Fetching current matches from CricketData.org...');
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === 'success' && json.data) {
      matchCache.data = json.data;
      matchCache.timestamp = now;
      matchCache.ttl = 120000; // Reset to 2 min on success
      console.log(`✅ Fetched ${json.data.length} matches (${json.info?.hitsUsed || '?'}/${json.info?.hitsLimit || '?'} hits used)`);
      return json.data;
    } else {
      // API limit hit — extend TTL to 6 hours to use stale/cached data without hammering API
      if (matchCache.data) matchCache.ttl = 21600000;
      console.log('⚠ API limit hit, using cached data for 6h. Status:', json.status, json.info);
      return matchCache.data; // Return stale cache if available
    }
  } catch (err) {
    console.error('❌ Error fetching matches:', err.message);
    return matchCache.data;
  }
}

async function fetchScorecard(matchId) {
  if (!CRICKET_API_KEY || !matchId) return null;

  const now = Date.now();
  if (scorecardCache.data && scorecardCache.matchId === matchId && (now - scorecardCache.timestamp) < scorecardCache.ttl) {
    return scorecardCache.data;
  }

  try {
    const url = `${CRICKET_API_BASE}/match_scorecard?apikey=${CRICKET_API_KEY}&id=${matchId}`;
    console.log(`🏏 Fetching scorecard for match ${matchId}...`);
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === 'success' && json.data) {
      scorecardCache.data = json.data;
      scorecardCache.matchId = matchId;
      scorecardCache.timestamp = now;
      return json.data;
    }
    return scorecardCache.data;
  } catch (err) {
    console.error('❌ Error fetching scorecard:', err.message);
    return scorecardCache.data;
  }
}

function findIPLMatch(matches) {
  if (!matches || !Array.isArray(matches)) return null;

  // Priority 1: Live IPL match
  const liveIPL = matches.find(m =>
    m.matchStarted === true &&
    m.matchEnded === false &&
    (m.name?.toLowerCase().includes('ipl') ||
     m.series_id?.toLowerCase().includes('ipl') ||
     m.name?.toLowerCase().includes('indian premier league') ||
     // Also check series name patterns
     m.status?.toLowerCase().includes('innings'))
  );
  if (liveIPL) return { match: liveIPL, isLive: true };

  // Priority 2: Any live T20 match (fallback)
  const liveT20 = matches.find(m =>
    m.matchStarted === true &&
    m.matchEnded === false &&
    m.matchType === 't20'
  );
  if (liveT20) return { match: liveT20, isLive: true };

  // Priority 3: Any live match
  const liveAny = matches.find(m =>
    m.matchStarted === true &&
    m.matchEnded === false
  );
  if (liveAny) return { match: liveAny, isLive: true };

  // Priority 4: Most recently completed IPL match
  const recentIPL = matches.find(m =>
    m.matchEnded === true &&
    (m.name?.toLowerCase().includes('ipl') ||
     m.matchType === 't20')
  );
  if (recentIPL) return { match: recentIPL, isLive: false };

  // Priority 5: Any recent match
  const recentAny = matches.find(m => m.matchEnded === true);
  if (recentAny) return { match: recentAny, isLive: false };

  return null;
}

function buildMatchEvents(match, scorecard) {
  const events = [];

  // Extract events from score data
  if (match.score && Array.isArray(match.score)) {
    match.score.forEach(innings => {
      if (innings.r !== undefined && innings.w !== undefined && innings.o !== undefined) {
        events.push({
          text: `${innings.inning}: ${innings.r}/${innings.w} (${innings.o} ov)`,
          type: 'score'
        });
      }
    });
  }

  // Extract events from scorecard batting data
  if (scorecard?.scorecard && Array.isArray(scorecard.scorecard)) {
    scorecard.scorecard.forEach(inning => {
      if (inning.batting && Array.isArray(inning.batting)) {
        // Top scorers
        const sortedBatsmen = [...inning.batting]
          .filter(b => b.r >= 30)
          .sort((a, b) => b.r - a.r)
          .slice(0, 3);

        sortedBatsmen.forEach(b => {
          const fours = b['4s'] || 0;
          const sixes = b['6s'] || 0;
          if (b.r >= 50) {
            events.push({
              text: `🏏 FIFTY! ${b.batsman?.name || b.batsman} — ${b.r}(${b.b}) [${fours}×4, ${sixes}×6]`,
              type: 'milestone'
            });
          } else if (b.r >= 30) {
            events.push({
              text: `${b.batsman?.name || b.batsman} — ${b.r}(${b.b}) [${fours}×4, ${sixes}×6]`,
              type: 'batting'
            });
          }
        });

        // Wickets (dismissals)
        const dismissed = inning.batting.filter(b => b.dismissal && b.dismissal !== 'not out');
        dismissed.slice(-3).forEach(b => {
          events.push({
            text: `WICKET! ${b.batsman?.name || b.batsman} — ${b.dismissal}`,
            type: 'wicket'
          });
        });
      }

      // Top bowlers
      if (inning.bowling && Array.isArray(inning.bowling)) {
        const topBowlers = [...inning.bowling]
          .filter(b => b.W >= 2)
          .sort((a, b) => b.W - a.W)
          .slice(0, 2);

        topBowlers.forEach(b => {
          events.push({
            text: `🎯 ${b.bowler?.name || b.bowler} — ${b.W}/${b.R} (${b.O} ov)`,
            type: 'bowling'
          });
        });
      }
    });
  }

  // Add match status
  if (match.status) {
    events.push({
      text: `📋 ${match.status}`,
      type: 'status'
    });
  }

  // If no events from API data, add basic match info
  if (events.length === 0) {
    events.push({
      text: match.name || 'Match data loading...',
      type: 'info'
    });
    if (match.venue) {
      events.push({
        text: `📍 ${match.venue}`,
        type: 'info'
      });
    }
  }

  return events;
}

async function updateMatchData() {
  const matches = await fetchCurrentMatches();
  if (!matches) return;

  const result = findIPLMatch(matches);
  if (!result) {
    // No matches found — keep whatever we have or use defaults
    if (!currentMatchData.matchId) {
      currentMatchData.status = 'No live matches at the moment';
      currentMatchData.events = [
        { text: 'No live cricket matches right now', type: 'info' },
        { text: 'Check back during match time for real-time updates', type: 'info' }
      ];
    }
    return;
  }

  const { match, isLive } = result;

  // Fetch scorecard for more detailed events
  let scorecard = null;
  if (match.id) {
    scorecard = await fetchScorecard(match.id);
  }

  // Build scores array
  const scores = [];
  if (match.score && Array.isArray(match.score)) {
    match.score.forEach(s => {
      scores.push({
        inning: s.inning || '',
        runs: s.r || 0,
        wickets: s.w || 0,
        overs: s.o || 0
      });
    });
  }

  // Get current overs
  let overs = '';
  if (scores.length > 0) {
    const lastInning = scores[scores.length - 1];
    overs = `${lastInning.overs} ov`;
  }

  currentMatchData = {
    isLive,
    matchName: match.name || 'Cricket Match',
    teams: match.teams || [],
    scores,
    status: match.status || (isLive ? 'In Progress' : 'Completed'),
    venue: match.venue || '',
    matchType: match.matchType || 't20',
    events: buildMatchEvents(match, scorecard),
    overs,
    matchId: match.id || null,
    dateTimeGMT: match.dateTimeGMT || '',
    seriesName: match.series_id || ''
  };

  console.log(`🏏 Match: ${currentMatchData.matchName} | Live: ${isLive} | Events: ${currentMatchData.events.length}`);
}

// ─── IN-MEMORY STATE ────────────────────────────────────────

let zones = {
  north: 65,
  south: 45,
  east: 80,
  west: 30
};

let queues = [
  { id: 'food', name: 'Food & Beverages', count: 12, status: 'open', waiters: [] },
  { id: 'merch', name: 'Merchandise Store', count: 5, status: 'open', waiters: [] },
  { id: 'rest_n', name: 'Restrooms (North)', count: 8, status: 'open', waiters: [] },
  { id: 'rest_s', name: 'Restrooms (South)', count: 3, status: 'open', waiters: [] }
];

let tickets = {};
let incidentLog = [];
let ticketCounter = 100;

const stationMap = {
  food: 'Gate 3',
  merch: 'Gate 5',
  rest_n: 'North Wing',
  rest_s: 'South Wing'
};

// ─── HELPERS ────────────────────────────────────────────────

function getQueueBroadcast() {
  return queues.map(q => ({
    id: q.id,
    name: q.name,
    count: q.count,
    waitMin: q.count * 2,
    status: q.status
  }));
}

function addIncident(message) {
  const entry = {
    timestamp: new Date().toISOString(),
    message
  };
  incidentLog.unshift(entry);
  if (incidentLog.length > 20) incidentLog = incidentLog.slice(0, 20);
  io.emit('incident', entry);
}

function getDensityLevel(value) {
  if (value > 75) return 'high';
  if (value >= 40) return 'medium';
  return 'low';
}

// ─── REST API ENDPOINTS ─────────────────────────────────────

app.get('/api/matches', (req, res) => {
  res.json({
    status: 'success',
    data: currentMatchData,
    apiKeyConfigured: !!CRICKET_API_KEY
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    matchDataAvailable: !!currentMatchData.matchId,
    apiKeyConfigured: !!CRICKET_API_KEY
  });
});

// ─── SOCKET.IO EVENTS ──────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send current state on connect
  socket.emit('density_update', { zones });
  socket.emit('queue_update', { queues: getQueueBroadcast() });
  socket.emit('incident_log', incidentLog);
  socket.emit('match_update', currentMatchData);

  // If user has a ticket, restore it
  socket.on('restore_ticket', ({ userId }) => {
    if (tickets[userId]) {
      socket.emit('ticket_restored', tickets[userId]);
    }
  });

  // ── FAN EVENTS ──

  socket.on('join_queue', ({ queueId, userId }) => {
    const queue = queues.find(q => q.id === queueId);
    if (!queue || queue.status !== 'open') return;

    if (tickets[userId]) return;

    ticketCounter++;
    const ticketNumber = ticketCounter;

    queue.count++;
    queue.waiters.push({ userId, ticketNumber, socketId: socket.id });
    tickets[userId] = { queueId, ticketNumber, queueName: queue.name };

    socket.emit('ticket_assigned', { queueId, ticketNumber, queueName: queue.name });
    io.emit('queue_update', { queues: getQueueBroadcast() });
  });

  socket.on('leave_queue', ({ queueId, userId }) => {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return;

    const waiterIdx = queue.waiters.findIndex(w => w.userId === userId);
    if (waiterIdx !== -1) {
      queue.waiters.splice(waiterIdx, 1);
      queue.count = Math.max(0, queue.count - 1);
    }
    delete tickets[userId];

    socket.emit('ticket_removed', { queueId });
    io.emit('queue_update', { queues: getQueueBroadcast() });
  });

  // ── OPS EVENTS ──

  socket.on('update_density', ({ zone, value }) => {
    if (zones.hasOwnProperty(zone)) {
      const prevLevel = getDensityLevel(zones[zone]);
      zones[zone] = Math.min(100, Math.max(0, value));
      const newLevel = getDensityLevel(zones[zone]);

      if (newLevel === 'high' && prevLevel !== 'high') {
        addIncident(`⚠ ${zone.charAt(0).toUpperCase() + zone.slice(1)} Stand reached high density (${zones[zone]}%)`);
      }

      io.emit('density_update', { zones });
    }
  });

  socket.on('call_next', ({ queueId }) => {
    const queue = queues.find(q => q.id === queueId);
    if (!queue || queue.waiters.length === 0) return;

    const nextPerson = queue.waiters.shift();
    queue.count = Math.max(0, queue.count - 1);
    delete tickets[nextPerson.userId];

    const station = stationMap[queueId] || 'Main Gate';
    io.to(nextPerson.socketId).emit('ticket_ready', {
      userId: nextPerson.userId,
      queueId,
      queueName: queue.name,
      station
    });

    addIncident(`✓ Ticket #${nextPerson.ticketNumber} called — ${queue.name}`);
    io.emit('queue_update', { queues: getQueueBroadcast() });
  });

  socket.on('toggle_queue', ({ queueId, status }) => {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return;
    queue.status = status;
    io.emit('queue_update', { queues: getQueueBroadcast() });
    addIncident(`${status === 'paused' ? '⏸' : '▶'} ${queue.name} ${status === 'paused' ? 'paused' : 'resumed'}`);
  });

  socket.on('simulate_surge', () => {
    const zoneNames = Object.keys(zones);
    const randomZone = zoneNames[Math.floor(Math.random() * zoneNames.length)];
    const originalValue = zones[randomZone];

    zones[randomZone] = 90 + Math.floor(Math.random() * 10);
    io.emit('density_update', { zones });
    addIncident(`⚡ Surge simulation triggered — ${randomZone.charAt(0).toUpperCase() + randomZone.slice(1)} Stand spiked to ${zones[randomZone]}%`);

    setTimeout(() => {
      zones[randomZone] = originalValue;
      io.emit('density_update', { zones });
      addIncident(`↩ Surge reset — ${randomZone.charAt(0).toUpperCase() + randomZone.slice(1)} Stand returned to ${originalValue}%`);
    }, 10000);
  });

  socket.on('log_incident', ({ message }) => {
    addIncident(`📝 ${message}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ─── PERIODIC BROADCASTS ────────────────────────────────────

// Zone & queue updates every 5 seconds
setInterval(() => {
  io.emit('density_update', { zones });
  io.emit('queue_update', { queues: getQueueBroadcast() });
}, 5000);

// Match data updates every 2 minutes (to preserve API hits)
setInterval(() => {
  updateMatchData().then(() => {
    io.emit('match_update', currentMatchData);
  });
}, 120000);

// ─── PRODUCTION STATIC FILE SERVING ─────────────────────────

// Serve Vite's built frontend in production
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// SPA fallback — serve index.html for any unmatched route
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not built. Run npm run build in /client first.' });
  }
});

// ─── START SERVER ───────────────────────────────────────────

const PORT = process.env.PORT || 3001;

// Initial match data fetch on startup
updateMatchData().then(() => {
  console.log(`🏏 Initial match data loaded: ${currentMatchData.matchName}`);
});

server.listen(PORT, () => {
  console.log(`⚡ AGL Server running on http://localhost:${PORT}`);
  console.log(`🏏 Cricket API Key: ${CRICKET_API_KEY ? 'Configured ✓' : 'Not set — using fallback data'}`);
  console.log(`📁 Static files: ${publicPath}`);
});
