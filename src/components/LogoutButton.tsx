import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies for session
      });

      if (res.ok) {
        localStorage.removeItem('user'); // Clear user info from localStorage
        navigate('/login'); // Redirect to login page
      } else {
        console.error('Failed to log out');
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
      Logout
    </button>
  );
};

export default LogoutButton;