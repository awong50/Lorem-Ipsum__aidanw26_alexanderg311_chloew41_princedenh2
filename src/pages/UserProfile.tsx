import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/UserProfile.module.css';
const API_URL = import.meta.env.VITE_API_URL;
import { FaRegUserCircle } from "react-icons/fa";

// Interfaces
interface TypingTest {
  wpm?: number;
  accuracy?: number;
  time?: number;
  date: string;
}

interface LatexTest {
  score?: number;
  latexStreak?: number;
  time?: number;
  date: string;
}

interface User {
  name: string;
  createdAt?: string;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const [typingTests, setTypingTests] = useState<TypingTest[]>([]);
  const [latexTests, setLatexTests] = useState<LatexTest[]>([]);
  const [user, setUser] = useState<User>({ name: '' });
  const [dateJoined, setDateJoined] = useState<string | undefined>(undefined);

  // Redirect if not logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/auth');
    }
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;
    const localUser = JSON.parse(stored);

    // Fetch full user object (with createdAt)
    fetch(`${API_URL}/api/user/${localUser.name}`)
      .then(res => res.json())
      .then((userData: User) => {
        setUser(userData);
        setDateJoined(userData.createdAt); // Set dateJoined from userData.createdAt
      })
      .catch(console.error);

    // Typing test history (expects array or { typingTests: [...] })
    fetch(`${API_URL}/api/typing-history/${localUser.name}`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTypingTests(data);
        } else if (Array.isArray(data.typingTests)) {
          setTypingTests(data.typingTests);
        } else {
          setTypingTests([]);
        }
      })
      .catch(console.error);

    // LaTeX results (expects array or { latexResults: [...] })
    fetch(`${API_URL}/api/latex-results/${localUser.name}`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLatexTests(data);
        } else if (Array.isArray(data.latexResults)) {
          setLatexTests(data.latexResults);
        } else {
          setLatexTests([]);
        }
      })
      .catch(console.error);
  }, []);

  const totalLatexTime = latexTests.reduce((acc, t) => acc + (t.time || 0), 0);
  const totalTypingTime = typingTests.reduce((acc, t) => acc + (t.time || 0), 0);
  const totalTests = typingTests.length + latexTests.length;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const highestWPM = typingTests.length
  ? Math.max(...typingTests.map(t => t.wpm ?? 0))
  : '-';

  const highestAccuracy = typingTests.length
    ? Math.max(...typingTests.map(t => t.accuracy ?? 0))
    : '-';

  const highestLatex = latexTests.length
    ? Math.max(...latexTests.map(t => t.score ?? t.latexStreak ?? 0))
    : '-';

  return (
    <div className={styles.container}>
      <div className={styles.topCards}>
        <div className={styles.userCard}>
          <div className={styles.userIconContainer}>
            <FaRegUserCircle className={styles.userIcon}/>
          </div>
          <div>
            <h2 className={styles.username}>{user.name}</h2>
            <div>
              <p className={styles.statLabel}>Date Joined</p>
              <p className={styles.statValue}>
                {dateJoined ? new Date(dateJoined).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.stats}>
            <div>
              <p className={styles.statLabel}>Tests Completed</p>
              <p className={styles.statValue}>{totalTests}</p>
            </div>
            <div>
              <p className={styles.statLabel}>Total Time Spent</p>
              <p className={styles.statValue}>
                {formatDuration(totalTypingTime + totalLatexTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.highestCard}>
        <h2 className={styles.highestTitle}>Personal Bests</h2>
        <div className={styles.highestStats}>
          <div>
            <p className={styles.statLabel}>Highest WPM</p>
            <p className={styles.statValue}>{highestWPM}</p>
          </div>
          <div>
            <p className={styles.statLabel}>Highest Accuracy (%)</p>
            <p className={styles.statValue}>{highestAccuracy}</p>
          </div>
          <div>
            <p className={styles.statLabel}>Highest LaTeX Score</p>
            <p className={styles.statValue}>{highestLatex}</p>
          </div>
        </div>
      </div>

      <div className={styles.tables}>
        <div className={styles.tableContainer}>
          <h2 className={styles.tableTitle}>Typing Tests</h2>
          {typingTests.length === 0 ? (
            <p>No typing tests recorded yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>WPM</th>
                  <th>Accuracy (%)</th>
                  <th>Time (s)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {typingTests.map((test, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      {typeof test.wpm === 'number'
                        ? test.wpm
                        : (typeof test.wpm === 'number' && typeof test.time === 'number'
                            ? Math.round((test.wpm * 60) / test.time)
                            : '-')}
                    </td>
                    <td>{test.accuracy ?? '-'}</td>
                    <td>{test.time ?? '-'}</td>
                    <td>{new Date(test.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.tableContainer}>
          <h2 className={styles.tableTitle}>LaTeX Tests</h2>
          {latexTests.length === 0 ? (
            <p>No LaTeX tests recorded yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>LaTeX Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {latexTests.map((test, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{test.score ?? test.latexStreak ?? '-'}</td>
                    <td>{new Date(test.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;