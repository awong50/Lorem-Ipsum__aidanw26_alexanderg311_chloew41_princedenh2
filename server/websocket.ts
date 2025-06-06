import { WebSocketServer, WebSocket } from 'ws';

interface Client {
  ws: WebSocket;
  lobbyId: string;
  username: string;
}

interface LobbyMeta {
  host: string;
  time: number;
  scores: Record<string, { wpm: number; accuracy: number }>;
}

const lobbies: Record<string, Client[]> = {};
const lobbyMeta: Record<string, LobbyMeta> = {};

export function setupWebSocketServer(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket) => {
    let currentLobbyId = '';
    let currentUsername = '';

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { type, lobbyId, username, time, to, wpm, accuracy, sampleText } = message;

        if (type === 'join') {
          currentLobbyId = lobbyId;
          currentUsername = username || `guest-${Math.random().toString(36).slice(2, 8)}`;
          if (!lobbies[lobbyId]) lobbies[lobbyId] = [];
          if (!lobbyMeta[lobbyId]) {
            lobbyMeta[lobbyId] = { host: currentUsername, time: time || 60, scores: {} };
          }

          // Remove any existing client with the same username
          lobbies[lobbyId] = lobbies[lobbyId].filter(c => c.username !== currentUsername);
          lobbies[lobbyId].push({ ws, lobbyId, username: currentUsername });
          broadcastParticipants(lobbyId);
        }

        if (type === 'leave') {
          removeClient(ws, lobbyId);
          broadcastParticipants(lobbyId);
        }

        if (type === 'start_test') {
          broadcast(lobbyId, { type: 'start_test' });
        }

        if (type === 'sample_text') {
          broadcast(lobbyId, { type: 'sample_text', sampleText });
        }

        if (type === 'set_time' && lobbyMeta[lobbyId]?.host === username) {
          lobbyMeta[lobbyId].time = time;
          broadcast(lobbyId, { type: 'set_time', time });
        }

        if (type === 'kick' && lobbyMeta[lobbyId]?.host === username) {
          const target = lobbies[lobbyId].find(c => c.username === to);
          if (target) target.ws.close();
        }

        if (type === 'transfer_host' && lobbyMeta[lobbyId]?.host === username) {
          lobbyMeta[lobbyId].host = to;
          broadcastParticipants(lobbyId);
        }

        if (type === 'score_update') {
          if (!lobbyMeta[lobbyId].scores) lobbyMeta[lobbyId].scores = {};
          lobbyMeta[lobbyId].scores[username] = { wpm, accuracy };

          broadcast(lobbyId, {
            type: 'leaderboard_update',
            leaderboard: Object.entries(lobbyMeta[lobbyId].scores)
              .map(([user, stats]) => ({
                user,
                wpm: stats.wpm,
                accuracy: stats.accuracy,
                score: Math.round(stats.wpm * (stats.accuracy / 100))
              }))
              .sort((a, b) => b.score - a.score)
          });
        }
      } catch (err) {
        console.error('[WS] error:', err);
      }
    });

    ws.on('close', () => {
      removeClient(ws, currentLobbyId);
      broadcastParticipants(currentLobbyId);
    });
  });
}

function broadcast(lobbyId: string, data: any) {
  const message = JSON.stringify(data);
  (lobbies[lobbyId] || []).forEach(c => {
    if (c.ws.readyState === c.ws.OPEN) c.ws.send(message);
  });
}

function broadcastParticipants(lobbyId: string) {
  const clients = lobbies[lobbyId] || [];
  const meta = lobbyMeta[lobbyId];
  const users = clients.map(c => ({
    name: c.username,
    isHost: meta?.host === c.username
  }));
  broadcast(lobbyId, { type: 'participants_update', users });
}

function removeClient(ws: WebSocket, lobbyId: string) {
  if (!lobbies[lobbyId]) return;
  lobbies[lobbyId] = lobbies[lobbyId].filter(c => c.ws !== ws);
  if (lobbies[lobbyId].length === 0) {
    delete lobbies[lobbyId];
    delete lobbyMeta[lobbyId];
  } else {
    // If host left, assign new host
    if (lobbyMeta[lobbyId] && !lobbies[lobbyId].some(c => c.username === lobbyMeta[lobbyId].host)) {
      lobbyMeta[lobbyId].host = lobbies[lobbyId][0].username;
    }
  }
}

export function getLobbies() {
  return Object.keys(lobbies).map((lobbyId) => ({
    lobbyId,
    participants: [...new Set(lobbies[lobbyId].map((c) => c.username))],
  }));
}

export function getLobby(lobbyId: string) {
  if (!lobbies[lobbyId]) return null;
  return {
    lobbyId,
    participants: [...new Set(lobbies[lobbyId].map((c) => c.username))],
  };
}