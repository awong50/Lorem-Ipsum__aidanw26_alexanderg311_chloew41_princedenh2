import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import styles from '@css/Typing.module.css';
import TypingRenderer from '../components/TypingRenderer';
import { FaCrown } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || '';

const CHARS_PER_LINE = 70;
const LINE_HEIGHT = 47; // px, adjust to match your CSS

function GameLobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const [params] = useSearchParams();
  const wsUrl = params.get('ws');
  const timeParam = parseInt(params.get("time") || "60", 10);

  const [participants, setParticipants] = useState<{ name: string; isHost: boolean }[]>([]);
  const [, setHost] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [sampleText, setSampleText] = useState('');
  const [gotSampleText, setGotSampleText] = useState(false);
  const [gotStartSignal, setGotStartSignal] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ user: string; wpm: number; accuracy: number }[]>([]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [, setWpm] = useState(0);
  const [, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(timeParam);
  const [finished, setFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputRefLive = useRef<string>('');

  const storedUser = localStorage.getItem('user');
  const userId = storedUser ? JSON.parse(storedUser).name : `guest-${Math.random().toString(36).substring(2, 9)}`;

  const beginTest = () => {
    if (testStarted) return;
    setTestStarted(true);
    setStartTime(Date.now());
    setFinished(false);
    setTimeLeft(timeParam);
    setShowResults(false);
  };

  useEffect(() => {
    if (testStarted) {
      inputRef.current?.focus();
    }
  }, [testStarted]);

  useEffect(() => {
    if (gotSampleText && gotStartSignal && !testStarted) {
      beginTest();
    }
  }, [gotSampleText, gotStartSignal]);

  useEffect(() => {
    const container = document.getElementById('sampleTextContainer');
    const scroller = document.getElementById('sampleTextScroller');
    if (container && scroller) {
      const caretPos = input.length;
      const currentLine = Math.floor(caretPos / CHARS_PER_LINE);
      if (currentLine > 4) {
        const scrollY = (currentLine - 4) * LINE_HEIGHT;
        scroller.style.transform = `translateY(-${scrollY}px)`;
      } else {
        scroller.style.transform = 'translateY(0px)';
      }
    }
  }, [input]);

  useEffect(() => {
    if (!wsUrl || socketRef.current) return;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'join',
        lobbyId,
        username: userId,
        time: timeParam,
      }));
    };

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      switch (data.type) {
        case 'participants_update':
          setParticipants(data.users);
          const hostUser = data.users.find((u: any) => u.isHost);
          setHost(hostUser?.name ?? null);
          setIsHost(hostUser?.name === userId);
          break;
        case 'sample_text':
          setSampleText(data.sampleText);
          setGotSampleText(true);
          if (gotStartSignal) beginTest();
          break;
        case 'start_test':
          setGotStartSignal(true);
          if (gotSampleText) beginTest();
          break;
        case 'leaderboard_update':
          setLeaderboard(data.leaderboard);
          break;
      }
    };

    socket.onclose = () => console.log(`Disconnected from lobby ${lobbyId}`);

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'leave', lobbyId, username: userId }));
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, [wsUrl, lobbyId, userId]);

  useEffect(() => {
    if (!startTime || finished) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(timeParam - Math.floor(elapsed), 0);
      setTimeLeft(remaining);
      if (remaining <= 0) setFinished(true);

      const elapsedMinutes = elapsed / 60;
      const wordsTyped = inputRefLive.current.trim().split(/\s+/).filter(Boolean);
      const correctWords = wordsTyped.filter((word, i) => word === sampleText.split(/\s+/)[i]).length;
      const wpmCalc = elapsedMinutes > 0 ? Math.round(correctWords / elapsedMinutes) : 0;
      const chars = inputRefLive.current.length;
      const correctChars = inputRefLive.current.split('').filter((c, i) => c === sampleText[i]).length;
      const accCalc = chars > 0 ? Math.round((correctChars / chars) * 100) : 100;
      setWpm(wpmCalc);
      setAccuracy(accCalc);
      socketRef.current?.send(JSON.stringify({
        type: 'score_update',
        lobbyId,
        username: userId,
        wpm: wpmCalc,
        accuracy: accCalc,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, finished]);

  useEffect(() => {
    if (finished) {
      setShowResults(true);
    }
  }, [finished]);

  const handleStart = async () => {
    if (!isHost || !socketRef.current) return;
    const response = await fetch(`${API_URL}/api/words`);
    let words = await response.json();

    // Shuffle the words array
    interface WordObj {
      word: string;
      sort: number;
    }

    words = (words as string[])
      .map((word: string): WordObj => ({ word, sort: Math.random() }))
      .sort((a: WordObj, b: WordObj) => a.sort - b.sort)
      .map(({ word }: WordObj) => word);

    const wordsCount = Math.max(10, Math.round((timeParam / 3) * 10));
    // Take a random slice of shuffled words
    const sample = words.slice(0, wordsCount).join(' ');

    socketRef.current.send(JSON.stringify({ type: 'sample_text', lobbyId, sampleText: sample, host: userId }));
    setTimeout(() => {
      socketRef.current?.send(JSON.stringify({ type: 'start_test', lobbyId, host: userId }));
    }, 250);
  };

  const handleLogout = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'leave', lobbyId }));
      socketRef.current.close();
    }
    socketRef.current = null;
    navigate('/lobby');
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    setInput('');
    setTestStarted(false);
    setGotSampleText(false);
    setGotStartSignal(false);
    setFinished(false);
    setLeaderboard([]);
    setWpm(0);
    setAccuracy(100);
    setStartTime(null);
  };

  return (
    <div className={styles.container} style={{ display: 'flex', flexDirection: 'row', gap: 60 }}>
      {showResults ? (
        <div
          style={{
            width: '100%',
            minHeight: 400,
            background: '#23272f',
            border: '2px solid #1976d2',
            borderRadius: 12,
            padding: '2.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '60px auto 0 auto',
            maxWidth: 700,
          }}
        >
          <h2 style={{ color: '#00adb5', fontWeight: 700, fontSize: 32, marginBottom: 24 }}>Results</h2>
          <table style={{ width: '100%', marginBottom: 32, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1976d2' }}>
                <th style={{ color: '#fff', fontWeight: 700, padding: 8, textAlign: 'left' }}>Player</th>
                <th style={{ color: '#fff', fontWeight: 700, padding: 8 }}>WPM</th>
                <th style={{ color: '#fff', fontWeight: 700, padding: 8 }}>Accuracy</th>
                <th style={{ color: '#fff', fontWeight: 700, padding: 8 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={idx} style={{
                  background: entry.user === userId ? '#1a1d23' : 'transparent',
                  fontWeight: entry.user === userId ? 700 : 400
                }}>
                  <td style={{ padding: 8 }}>
                    {entry.user}
                    {entry.user === userId && <span style={{ color: '#2196f3', marginLeft: 8 }}>(You)</span>}
                  </td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{entry.wpm}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{entry.accuracy}%</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>
                    <strong>{(entry.wpm * entry.accuracy / 100).toFixed(1)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 24 }}>
            <button
              style={{
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '0.75em 2em',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer'
              }}
              onClick={handleLogout}
            >
              Leave Lobby
            </button>
            <button
              style={{
                background: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '0.75em 2em',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer'
              }}
              onClick={handlePlayAgain}
            >
              Play Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {testStarted && (
            <div
              className={styles.leaderboard}
              style={{
                minWidth: 220,
                marginRight: 24,
                background: '#23272f',
                border: '2px solid #1976d2',
                borderRadius: 12,
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 61,
              }}
            >
              <h3 style={{ marginBottom: 16, color: '#00adb5', fontWeight: 700, fontSize: 22}}>Leaderboard</h3>
              <ol style={{ width: '100%', paddingLeft: 20 }}>
                {leaderboard.map((entry, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: 10,
                      fontWeight: idx === 0 ? 700 : 500,
                      color: idx === 0 ? '#ffd700' : '#fff',
                      fontSize: idx === 0 ? 20 : 16,
                      background: idx === 0 ? 'rgba(76,175,80,0.12)' : 'transparent',
                      borderRadius: 6,
                      padding: '4px 8px',
                    }}
                  >
                    {entry.user}: <strong>{(entry.wpm * entry.accuracy / 100).toFixed(1)}</strong>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className={styles.sidebar}>
            {!testStarted && <h2>{lobbyId}</h2>}

            {!testStarted && (
              <>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: 16 }}>
                  <div style={{ border: '2px solid #2196f3', borderRadius: 8, padding: 12, width: '40%', marginBottom: 50, marginTop: 50 }}>
                    <h3>Participants</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {participants.map((p, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 8,
                            background: p.name === userId ? '#e3f2fd' : 'transparent',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontWeight: p.name === userId ? 600 : 400,
                            color: p.isHost ? '#1976d2' : '#333',
                            border: p.isHost ? '1px solid #1976d2' : 'none',
                          }}
                        >
                          {p.isHost && (
                            <FaCrown style={{ color: '#ffd700', marginRight: 6, fontSize: 18 }} />
                          )}
                          <span>{p.name}</span>
                          {p.name === userId && (
                            <span style={{ marginLeft: 8, color: '#2196f3', fontSize: 12 }}>(You)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ border: '2px solid #4caf50', borderRadius: 8, padding: 12, minWidth: 1200, minHeight: 100, marginTop: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Test Time</h3>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#388e3c' }}>{timeParam}s</div>
                  </div>
                </div>

                {isHost && !testStarted && (
                  <div style={{ marginBottom: 16, display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={handleLogout} style={{ width: "30rem" }}>Leave</button>
                    <button onClick={handleStart} style={{ width: "30rem" }}>Start Test</button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className={styles.typingArea}>
            {!testStarted ? (
              <div>
              </div>
            ) : (
              <div className={styles.typingBox}>
                <h1><strong>{timeLeft}</strong></h1>
                <div
                  className={styles.sampleBox}
                  onClick={() => inputRef.current?.focus()}
                  id="sampleTextContainer"
                  style={{
                    maxHeight: 140,
                    minHeight: 140,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    background: '#23272f',
                    borderRadius: 8,
                    border: '2px solid #2196f3',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    position: 'relative',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE/Edge
                  }}
                >
                  <div
                    id="sampleTextScroller"
                    style={{
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    <TypingRenderer input={input} sampleText={sampleText} finished={finished} />
                  </div>
                  <style>
                    {`
                      #sampleTextContainer::-webkit-scrollbar {
                        display: none;
                      }
                    `}
                  </style>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      const sampleWords = sampleText.split(' ');
                      const inputWords = newVal.trimEnd().split(' ');
                      const currentWordIndex = inputWords.length - 1;

                      const isDeleting = newVal.length < inputRefLive.current.length;
                      // If the next character in sampleText is a space, require user to type space
                      if (
                        !isDeleting &&
                        sampleText[inputRefLive.current.length] === ' ' &&
                        newVal.length > inputRefLive.current.length &&
                        newVal[newVal.length - 1] !== ' '
                      ) {
                        // Block input if user tries to type next word without space
                        e.preventDefault?.();
                        return;
                      }
                      // Prevent typing next word unless a space has been pressed
                      const inputWordCount = newVal.trim().split(/\s+/).length;
                      if (
                        !isDeleting &&
                        inputWordCount > sampleWords.length
                      ) {
                        // Don't allow more words than sample
                        e.preventDefault?.();
                        return;
                      }

                      if (
                        !isDeleting &&
                        inputWords.length > sampleWords.length
                      ) {
                        e.preventDefault?.();
                        return;
                      }

                      // Prevent typing into the next word unless a space was typed
                      if (
                        !isDeleting &&
                        currentWordIndex > 0 &&
                        !newVal.endsWith(' ') &&
                        newVal.split(' ').length > inputRefLive.current.split(' ').length
                      ) {
                        e.preventDefault?.();
                        return;
                      }

                      setInput(newVal);
                      inputRefLive.current = newVal;
                    }}
                    disabled={finished}
                    className={styles.textarea}
                    placeholder="Start typing..."
                    rows={3}
                    cols={60}
                    style={{
                      opacity: 0,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      resize: 'none',
                      pointerEvents: finished ? 'none' : 'auto',
                      zIndex: 2,
                      cursor: 'default',
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      // Prevent arrow key navigation
                      if (
                        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)
                      ) {
                        e.preventDefault();
                        return;
                      }

                      // Prevent space unless correct
                      if (
                        e.key === ' ' &&
                        !(input.length < sampleText.length && sampleText[input.length] === ' ')
                      ) {
                        e.preventDefault();
                        return;
                      }

                      // Prevent Enter and Tab from inserting characters
                      if (['Tab', 'Enter'].includes(e.key)) {
                        e.preventDefault();

                        if (e.key === 'Tab') {
                          const focusable = document.querySelectorAll(
                            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                          );
                          const focusArray = Array.prototype.slice.call(focusable);
                          const index = focusArray.indexOf(document.activeElement);
                          if (index > -1) {
                            const next = focusArray[index + 1] || focusArray[0];
                            next.focus();
                          }
                        } else if (e.key === 'Enter') {
                          const active = document.activeElement as HTMLElement;
                          if (active && typeof active.click === 'function') {
                            active.click();
                          }
                        }
                        return;
                      }
                    }}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GameLobby;