import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { use, useEffect, useState} from 'react';
import { set } from 'lodash';

function GameLobby() {
  const { lobbyId } = useParams();
  const [params] = useSearchParams();
  const [users, setUsers] = useState<string[]>([]);

  const wsUrl = params.get('ws');
  console.log('Attempting to connect to', wsUrl);

  useEffect(() => {
    const fetchUsers = () => {
      fetch('http://localhost:3000/api/lobbies/' + lobbyId + '/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
        .catch(() => setUsers([]));
    };
  
    fetchUsers();
  }, [lobbyId]);
  
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
      <h2>Users in this lobby:</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
}
export default GameLobby;
