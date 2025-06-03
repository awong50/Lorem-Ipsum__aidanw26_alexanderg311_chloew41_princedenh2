/* 
Plan:
1. Create a Lobby page that has the options to create or join a server. 
2. Use a form to input the server name and a button to create the server.
*/

import React, {useEffect, useState } from "react";
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
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [lobbies, setLobbies] = useState<{ lobbyId: string, participants: string[] }[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [username, setUsername] = useState<string>(() => {
    const user = localStorage.getItem('user');
    try { return user ? JSON.parse(user).name : ''; } catch { return ''; }
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) navigate('/auth');

    const fetchLobbies = () => {
      fetch('http://localhost:3000/api/lobbies')
        .then(res => res.json())
        .then(setLobbies)
        .catch(() => setLobbies([]));
    };

    fetchLobbies(); // Initial fetch

    const interval = setInterval(fetchLobbies, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  // Create server and auto-join
  const createServer = async () => {
    const response = await fetch('http://localhost:3000/api/create-ws-server');
    const data = await response.json();
    setWsUrl(data.wsUrl);
    joinLobby(data.wsUrl, data.lobbyId);
  };

  // Join an existing lobby
  const joinLobby = (wsUrl: string, lobbyId: string) => {
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', username }));
    };
    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'participants') setParticipants(data.participants);
    };
    navigate(`/lobby/${lobbyId}?ws=${encodeURIComponent(wsUrl)}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem 10rem", maxWidth: "1100px", width: "100%" }}>
        <HoverCard>
          <h2>Available Servers</h2>
          <ul>
            {lobbies.map(lobby => (
              <li key={lobby.lobbyId}>
                Lobby {lobby.lobbyId} ({lobby.participants.length} participants)
                <button onClick={() => joinLobby(`ws://localhost:${lobby.lobbyId}`, lobby.lobbyId)}>Join</button>
              </li>
            ))}
          </ul>
        </HoverCard>
        <HoverCard>
          <button onClick={createServer}>Create Server</button>
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

