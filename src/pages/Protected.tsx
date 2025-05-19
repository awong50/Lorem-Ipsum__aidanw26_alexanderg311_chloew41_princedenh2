import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Protected = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login'); // Redirect to login if not logged in
    }
  }, [navigate]);

  return <h1>This is a protected page. You are logged in!</h1>;
};

export default Protected;