import React, { useState } from 'react';

interface Props {
  onCreate: (lobbyName: string, time: number) => void;
  onClose: () => void;
}

const RoomSettingsModal: React.FC<Props> = ({ onCreate, onClose }) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState(60);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: '#23272f', padding: '2em', borderRadius: 10,
        minWidth: 300, display: 'flex', flexDirection: 'column', gap: '1em'
      }}>
        <h2>Create Room</h2>
        <div style={{ color: '#fff', fontWeight: 'bold' }}>Room Name</div>
        <input placeholder="Enter room name here" value={name} onChange={e => setName(e.target.value)} />
        <div style={{ color: '#fff', fontWeight: 'bold' }}>Test Time (seconds)</div>
        <input type="number" placeholder="Time in seconds" value={time} onChange={e => setTime(+e.target.value)} />
        <button onClick={() => onCreate(name, time)}>Create</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default RoomSettingsModal;
