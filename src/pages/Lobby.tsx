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
    // Redirect if not logged in
   const navigate = useNavigate();
   useEffect(() => {
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/auth');
      }
    }, [navigate]);
  
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  const createServer = async () => {
// replace with the server URL once updated
   const response = await fetch('http://localhost:3000/api/create-ws-server');
    const data = await response.json();
    setWsUrl(data.wsUrl);
    console.log(data.wsUrl);
    if (data.wsUrl !== null) {
            // Connect to the new WebSocket server
    const socket = new WebSocket(data.wsUrl);
    const lobbyId = data.lobbyId;
    socket.onopen = () => console.log('Connected to WebSocket server');
    socket.onmessage = (msg) => alert(`Received: ${msg.data}`);
        navigate(`/lobby/${lobbyId}?ws=${encodeURIComponent(data.wsUrl)}`);
    }
    else {
        alert("WebSocket URL is not available. Please try again.");
    }
   
  };
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "2.5rem 10rem",
        maxWidth: "1100px",
        width: "100%",
      }}
    >
      <HoverCard>
    <form>
      <label htmlFor="serverName">Server Name:</label>
      <input type="text" id="serverName" name="serverName" required />
      <button type="submit">Join Server</button>
    </form>
      </HoverCard>
      <HoverCard>
       <button onClick={createServer}>
      Create Server {wsUrl && <p>Connected to WebSocket server at: {wsUrl}</p>}</button>
      </HoverCard>

    </div>
  </div>
  );
};


export default Lobby;

