import { useState } from 'react';

interface CustomTimeModalProps {
  onClose: () => void;
  onSubmit: (seconds: number) => void;
}

export default function CustomTimeModal({ onClose, onSubmit }: CustomTimeModalProps) {
  const [value, setValue] = useState('');

const handleConfirm = () => {
    const seconds = parseInt(value);
    if (!isNaN(seconds) && seconds >= 5) {
        onSubmit(seconds);
        onClose();
    } else {
        // Show a custom styled alert inside the modal
        const alertDiv = document.createElement('div');
        alertDiv.textContent = 'Please enter a valid number (≥ 5)';
        Object.assign(alertDiv.style, {
            position: 'fixed',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ff5252',
            color: '#fff',
            padding: '1em 2em',
            borderRadius: '8px',
            fontSize: '1.1em',
            zIndex: 2000,
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        });
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 1800);
    }
};

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: '1em', color: '#fff' }}>Custom Duration (seconds)</h2>
        <input
          type="number"
          min={5}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            padding: '0.5em',
            width: '100%',
            borderRadius: 6,
            border: '1px solid #00adb5',
            marginBottom: '1em',
            fontSize: '1em',
            outline: 'none',
            boxShadow: '0 0 0 2px transparent',
          }}
          autoFocus
          onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px #00adb5'}
          onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px transparent'}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleConfirm} style={buttonStyle}>Set</button>
          <button onClick={onClose} style={{ ...buttonStyle, backgroundColor: '#777' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#222',
  padding: '2em',
  borderRadius: 10,
  width: 300,
};

const buttonStyle: React.CSSProperties = {
  padding: '0.5em 1em',
  backgroundColor: '#00adb5',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};
