// Shared Socket.io client. Connects with the JWT so the server can
// place the user in their personal + city rooms.

import { io } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  if (socket && socket.connected) return socket;

  // In dev, Vite proxies /socket.io to :5000. In production it hits the same origin
  // or VITE_API_URL's host.
  const url = import.meta.env.VITE_SOCKET_URL || undefined;
  socket = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
