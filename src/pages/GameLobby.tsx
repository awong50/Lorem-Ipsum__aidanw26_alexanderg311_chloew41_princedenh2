import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  users?: string[];
  user?: string;
}

function GameLobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const [params] = useSearchParams();
  const wsUrl = params.get('ws');
  const [participants, setParticipants] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!wsUrl) return;

    // Clean up previous connection
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setConnectionStatus('connecting');
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      setConnectionStatus('error');
    };

    socket.onopen = () => {
      console.log(`Connected to lobby ${lobbyId}`);
      setConnectionStatus('connected');
      
      // Send join message
      socket.send(JSON.stringify({
        type: 'join',
        lobbyId,
        userId: `user-${Math.random().toString(36).substring(2, 9)}`,
      }));
    };

    socket.onmessage = (msg) => {
      try {
        const data: WebSocketMessage = JSON.parse(msg.data);
        console.log('Received:', data);
        
        if (data.type === 'participants_update') {
          if (data.users) {
            setParticipants(data.users);
          }
        } else if (data.type === 'user_joined' && data.user) {
          setParticipants(prev => [...prev, data.user]);
        } else if (data.type === 'user_left' && data.user) {
          setParticipants(prev => prev.filter(u => u !== data.user));
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    socket.onclose = () => {
      console.log(`Disconnected from lobby ${lobbyId}`);
      setConnectionStatus('disconnected');
    };

    return () => {
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'leave',
            lobbyId,
          }));
        }
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [wsUrl, lobbyId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <h1>Lobby {lobbyId}</h1>
      <p>Status: {connectionStatus}</p>
      
      <h2>Participants ({participants.length})</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {participants.map((user, index) => (
          <li key={index} style={{ margin: '8px 0' }}>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GameLobby;