import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from '@css/Lobby.module.css';

const Lobby = () => {
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket | null>(null);

  const [lobbies, setLobbies] = useState<{ lobbyId: string, participants: string[] }[]>([]);
  const [lobbyName, setLobbyName] = useState('');
  const username = (() => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).name : '';
    } catch {
      return '';
    }
  })();

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
    const socket = new WebSocket(`ws://localhost:3000`);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', lobbyId, username }));
      navigate(`/lobby/${lobbyId}`);
    };
  };

  const handleCreate = () => {
    if (!lobbyName) return alert('Enter a name for the server');
    joinLobby(lobbyName);
  };

  return (
    <div className={styles.container}>
      <div className={styles.createSection}>
        <input
          className={styles.input}
          placeholder="Lobby name"
          value={lobbyName}
          onChange={e => setLobbyName(e.target.value)}
        />
        <button className={styles.createButton} onClick={handleCreate}>Create Room</button>
      </div>

      <div className={styles.lobbyList}>
        {lobbies.map((lobby, index) => (
          <div key={lobby.lobbyId} className={styles.card}>
            {/* <div
              className={styles.banner}
              style={{ backgroundImage: `url(https://source.unsplash.com/random/800x200?sig=${index})` }}
            > */}
              {/* <div className={styles.tags}>
                <span className={styles.tagOpen}>Open</span>
                <span className={styles.tagFreestyle}>Freestyle</span>
              </div> */}
            {/* </div> */}

            <div className={styles.cardContent}>
              <div>
                <h3 className={styles.lobbyTitle}>{lobby.lobbyId}'s room</h3>

                <p className={styles.playerCount}>🎮 {lobby.participants.length} players</p>
              </div>
              <button className={styles.joinButton} onClick={() => joinLobby(lobby.lobbyId)}>Join</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
