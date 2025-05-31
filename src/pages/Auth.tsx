import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@css/Auth.module.css';
const API_URL = import.meta.env.VITE_API_URL;
const Auth = () => {
  const navigate = useNavigate();
  const [registerForm, setRegisterForm] = useState({ name: '', password: '' });
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [registerMsg, setRegisterMsg] = useState('');
  const [loginMsg, setLoginMsg] = useState('');

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (res.ok) {
        setRegisterMsg('Registered!');
        setRegisterForm({ name: '', password: '' });
      } else {
        setRegisterMsg(data.error || 'Registration failed');
      }
    } catch {
      setRegisterMsg('Network error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setLoginMsg('Login successful!');
        setTimeout(() => {
            navigate('/');
            window.location.reload();
        }, 500)
      } else {
        setLoginMsg(data.error || 'Login failed');
      }
    } catch {
      setLoginMsg('Network error');
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.form} onSubmit={handleRegister}>
        <h2>Register</h2>
        <input name="name" value={registerForm.name} onChange={handleRegisterChange} placeholder="Username" required />
        <input name="password" type="password" value={registerForm.password} onChange={handleRegisterChange} placeholder="Password" required />
        <button type="submit">Sign Up</button>
        {registerMsg && <p>{registerMsg}</p>}
      </form>

      <form className={styles.form} onSubmit={handleLogin}>
        <h2>Login</h2>
        <input name="name" value={loginForm.name} onChange={handleLoginChange} placeholder="Username" required />
        <input name="password" type="password" value={loginForm.password} onChange={handleLoginChange} placeholder="Password" required />
        <button type="submit">Sign In</button>
        {loginMsg && <p>{loginMsg}</p>}
      </form>
    </div>
  );
};

export default Auth;
