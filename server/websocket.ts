import { WebSocketServer, WebSocket } from 'ws';


interface Lobby {
  participants: Set<string>;
}

const lobbies: Record<string, Lobby> = {};

export function setupWebSocketServer(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket) => {
    let lobbyId = '';
    let username = '';

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'join' && data.lobbyId && data.username) {
          lobbyId = data.lobbyId;
          username = data.username;

          if (!lobbies[lobbyId]) {
            lobbies[lobbyId] = { participants: new Set() };
          }

          lobbies[lobbyId].participants.add(username);
          broadcastParticipants(wss, lobbyId);
        }
      } catch (e) {
        console.error('Invalid WS message', e);
      }
    });

    ws.on('close', () => {
      if (lobbyId && username) {
        lobbies[lobbyId]?.participants.delete(username);
        broadcastParticipants(wss, lobbyId);
      }
    });
  });
}

function broadcastParticipants(wss: WebSocketServer, lobbyId: string) {
  const message = JSON.stringify({
    type: 'participants',
    lobbyId,
    participants: Array.from(lobbies[lobbyId]?.participants || []),
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
export function getLobby(lobbyId: string) {
  return lobbies[lobbyId] || null;
}

export function getLobbies() {
  return Object.entries(lobbies).map(([lobbyId, lobby]) => ({
    lobbyId,
    participants: Array.from(lobby.participants),
  }));
}
