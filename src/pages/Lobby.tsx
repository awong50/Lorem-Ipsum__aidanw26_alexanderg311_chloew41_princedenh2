import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';

const baseCardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #232931 80%, #393e46 100%)",
  color: "#eeeeee",
  borderRadius: "1.2rem",
  padding: "2.2rem",
  boxShadow: "0 4px 24px rgba(0, 173, 181, 0.13)",
  maxWidth: "650px",
  width: "100%",
  border: "2px solid #00adb5",
  transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
  cursor: "pointer",
};

const headerStyle: React.CSSProperties = {
  color: "#a3bffa",
  fontWeight: 700,
  fontSize: "2rem",
  marginBottom: "1rem",
  letterSpacing: "0.03em",
};

function HoverCard({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...baseCardStyle,
        boxShadow: hovered
          ? "0 8px 32px rgba(163,191,250,0.25)"
          : baseCardStyle.boxShadow,
        transform: hovered ? "translateY(-6px) scale(1.03)" : "none",
        borderColor: hovered ? "#a3bffa" : baseCardStyle.border as string,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

const Lobby = () => {
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket | null>(null);

  const [lobbies, setLobbies] = useState<{ lobbyId: string, participants: string[] }[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [lobbyName, setLobbyName] = useState('');
  const [username, setUsername] = useState<string>(() => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).name : '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (!username) navigate('/auth');

    const fetchLobbies = () => {
      fetch('http://localhost:3000/api/lobbies')
        .then(res => res.json())
        .then(setLobbies)
        .catch(() => setLobbies([]));
    };

    fetchLobbies();
    const interval = setInterval(fetchLobbies, 2000);
    return () => clearInterval(interval);
  }, [navigate, username]);

  const joinLobby = (lobbyId: string) => {
    const wsUrl = `ws://localhost:3000`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', lobbyId, username }));
      navigate(`/lobby/${lobbyId}`);
    };

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'participants' && data.lobbyId === lobbyId) {
        setParticipants(data.participants);
      }
    };
  };

  const handleCreate = () => {
    if (!lobbyName) return alert('Enter a name for the server');
    joinLobby(lobbyName);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "2.5rem 10rem",
        maxWidth: "1100px",
        width: "100%"
      }}>
        <HoverCard>
          <h2>Available Servers</h2>
          <ul>
            {lobbies.map(lobby => (
              <li key={lobby.lobbyId}>
                <strong>{lobby.lobbyId}</strong> ({lobby.participants.length} participants)
                <button style={{ marginLeft: "10px" }} onClick={() => joinLobby(lobby.lobbyId)}>Join</button>
              </li>
            ))}
          </ul>
        </HoverCard>

        <HoverCard>
          <h2>Create Server</h2>
          <input
            type="text"
            placeholder="Lobby name"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            style={{
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "5px",
              border: "1px solid #00adb5",
              width: "100%"
            }}
          />
          <button onClick={handleCreate}>Create Lobby</button>
        </HoverCard>
      </div>

      {participants.length > 0 && (
        <div>
          <h3>Participants:</h3>
          <ul>
            {participants.map(p => <li key={p}>{p}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Lobby;
