import { useNavigate } from 'react-router-dom';
import logo from '../assets/prototype-logo.png'; // Update path if needed

const LogoButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '0',
        marginRight: '1rem',
      }}
    >
      <img src={logo} alt="Prototype Logo" style={{ height: '40px' }} />
    </button>
  );
};

export default LogoButton;
