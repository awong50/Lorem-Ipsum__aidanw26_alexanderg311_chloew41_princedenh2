import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from '@css/Lobby.module.css';
import RoomSettingsModal from '../components/RoomSettingsModal';

const Lobby = () => {
  const navigate = useNavigate();
  const [lobbies, setLobbies] = useState<{ lobbyId: string, participants: string[] }[]>([]);
  const [showModal, setShowModal] = useState(false);

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
      fetch('https://prototype.awong50.tech/api/lobbies')
        .then(res => res.json())
        .then(setLobbies)
        .catch(() => setLobbies([]));
    };

    fetchLobbies();
    const interval = setInterval(fetchLobbies, 2000);
    return () => clearInterval(interval);
  }, [navigate, username]);

  const joinLobby = (lobbyId: string, time?: number) => {
    const query = new URLSearchParams();
    query.set('ws', 'wss://prototype.awong50.tech:3000');
    if (time) query.set('time', time.toString());
    navigate(`/lobby/${lobbyId}?${query.toString()}`);
  };

  const handleCreate = (name: string, time: number) => {
    if (!name) return alert('Enter a name for the room');
    joinLobby(name, time);
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.createSection}>
        <button
          className={styles.createButton}
          style={{ backgroundColor: '#00adb5', color: '#222', marginLeft: '500px', marginTop: '50px' }}
          onClick={() => setShowModal(true)}
        >
          Create Room
        </button>
      </div>

      {showModal && (
        <RoomSettingsModal
          onCreate={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className={styles.lobbyList} style={{ overflow: "visible" }}>
        {lobbies.map((lobby) => (
          <div
        key={lobby.lobbyId}
        className={styles.card}
        onClick={() => joinLobby(lobby.lobbyId)}
        style={{ cursor: "pointer" }}
        tabIndex={0}
        onKeyPress={e => {
          if (e.key === "Enter" || e.key === " ") joinLobby(lobby.lobbyId);
        }}
          >
        <div className={styles.cardContent}>
          <div>
            <h3 className={styles.lobbyTitle}>{lobby.lobbyId}</h3>
            <p className={styles.playerCount}>🎮 {lobby.participants.length} players</p>
          </div>
        </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
