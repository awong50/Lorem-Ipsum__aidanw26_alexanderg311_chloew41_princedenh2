import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies for session
      });

      if (res.ok) {
        localStorage.removeItem('user'); // Clear user info from localStorage
        navigate('/'); 
        window.location.reload(); 
      } else {
        console.error('Failed to log out');
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <span onClick={handleLogout} style={{ marginLeft: '.1rem', cursor: 'pointer', color: 'rgb(192, 192, 192)'}}>
      Sign Out
    </span>
  );
};

export default LogoutButton;