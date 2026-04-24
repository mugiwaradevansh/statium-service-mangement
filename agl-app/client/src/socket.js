import { io } from 'socket.io-client';

// Connect to the same origin — Vite proxy forwards /socket.io → localhost:3001
// This works in both dev (via proxy) and production (same server)
const socket = io({
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  autoConnect: true
});

socket.on('connect', () => {
  console.log('⚡ Connected to AGL Server:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('🔴 Connection error:', err.message);
});

export default socket;
