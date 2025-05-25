import { useEffect, useState } from 'react';

interface TypingTest {
  wpm: number;
  accuracy: number;
  date: string;
}

const UserProfile = () => {
  const [history, setHistory] = useState<TypingTest[]>([]);
  const [user, setUser] = useState<{ name: string }>({ name: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;
    const user = JSON.parse(stored);
    setUser(user);

    fetch(`/api/typing-history/${user.name}`)
      .then(res => res.json())
      .then((data: TypingTest[]) => setHistory(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>{user.name}'s Typing History</h1>
      {history.length === 0 ? (
        <p>No tests recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>WPM</th>
              <th>Accuracy (%)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((test, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{test.wpm}</td>
                <td>{test.accuracy}</td>
                <td>{new Date(test.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserProfile;
