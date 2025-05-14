import { useState } from 'react';

const Home = () => {
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
    <div>
      <h1>Home Page</h1>
      <form onSubmit={handleSubmit} style={{ margin: '2em 0' }}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          type="email"
        />
        <input
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          type="password"
        />
        <button type="submit">Add User</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

export default Home;