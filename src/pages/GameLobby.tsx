import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

function GameLobby() {
  const { lobbyId } = useParams();
  const [params] = useSearchParams();
  const wsUrl = params.get('ws');
  console.log('Attempting to connect to', wsUrl);

  useEffect(() => {
    if (!wsUrl) return;

    const socket = new WebSocket(wsUrl);
    socket.onerror = (err) => console.error('WebSocket error:', err);
    socket.onopen = () => {
      console.log(`Connected to lobby ${lobbyId}`);
      socket.send(`User joined lobby ${lobbyId}`);
    };

    socket.onmessage = (msg) => {
      console.log('Received:', msg.data);
    };
    socket.onclose = () => {
      console.log(`Disconnected from lobby ${lobbyId}`);
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
      
    </div>
  );
}
export default GameLobby;
