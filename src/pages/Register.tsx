import { useState } from 'react';
import styles from '@css/Register.module.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage('User added!');
        setForm({ name: '', email: '', password: '' });
      } else {
        const data = await res.json();
        setMessage(data.error || 'Error adding user');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>Registration Page</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          type="password"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Add User
        </button>
      </form>
      {message && <div className={message.includes('error') ? styles.error : styles.message}>{message}</div>}
    </div>
  );
};

export default Register;