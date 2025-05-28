import React, { useState, useRef, useEffect} from "react";
import styles from '@css/Typing.module.css';
import { MdOutlineNavigateNext } from "react-icons/md";
import _ from 'lodash'; 
import ApexChart from "react-apexcharts";
const API_URL = import.meta.env.VITE_API_URL;

const Typing = () => {
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [finished, setFinished] = useState(false);
  const timeTotal = 15;
  const [timeLeft, setTimeLeft] = useState(timeTotal); // Countdown
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [sampleText, setSampleText] = useState<string>(""); // State to hold the sample text
  const [, setCaretIndex] = useState(0);
  const [inputFocused, setInputFocused] = useState(true);

  const [history, setHistory] = useState<{ wpm: number; accuracy: number }[]>([]);
  const inputRefLive = useRef<string>("");


  // Use refs for mutable counters
  const total = useRef(0);
  const correct = useRef(0);

  useEffect(() => {
    if (!finished) {
      inputRef.current?.focus();
    }
  }, [finished]);

  useEffect(() => {
    if (!startTime || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, finished, timeLeft]);

  useEffect(() => {
    if (!startTime) return;
    let endTime = Date.now();
    if (finished && input.length > 0) {
      endTime = startTime + (timeTotal - timeLeft) * 1000;
    }
    const elapsedMinutes = (endTime - startTime) / 1000 / 60;
    const words = input.trim().length === 0 ? 0 : input.trim().split(/\s+/).length;
    setWpm(elapsedMinutes > 0 ? Math.round(words / elapsedMinutes) : 0);
  }, [input, finished, startTime, timeLeft]);

  useEffect(() => {
    // Fetch sample text from the server
    const fetchSampleText = async () => {
      try {
        const response = await fetch(`${API_URL}/api/words`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const sample = _.sampleSize(data, 50).join(" "); // Sample 50 words
        setSampleText(sample);
      } catch (error) {
        console.error('Error fetching sample text:', error);
      }
    };
    fetchSampleText();
  }, []); 

  const renderSampleText = () => {
    return (
      <span style={{ position: 'relative', display: 'inline-block' }}>
        {sampleText.split('').map((char, idx) => {
          let color = '#bbb'; // default gray
          if (input.length > idx) {
            color = input[idx] === char ? '#fff' : '#f55'; // white if correct, red if wrong
          }
          return (
            <span
              key={idx}
              style={{
                color,
                background: input.length === idx ? 'transparent' : 'transparent',
                transition: 'color 0.3s',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                position: 'relative',
                
              }}
            >
              {char}
              {idx === input.length && !finished && (
              <span
                style={{
                  position: 'absolute',
                  left: '0%',
                  transition: 'right 0.3s',
                  top: 0,
                  width: '2px',
                  height: '1.2em',
                  backgroundColor: '#fff',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
            </span>
          );
        })}
      </span>
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return;

    const value = e.target.value;

    const newCharacter = value.length > input.length;

    if (newCharacter) {
      total.current++;
    }

    if (!startTime && value.length === 1) {
      setStartTime(Date.now());
    }
    setInput(value);

    if (newCharacter) {
      if (value[value.length - 1] === sampleText[value.length - 1]) correct.current++;
      const acc = value.length > 0 ? Math.round((correct.current / total.current) * 100) : 100;
      setAccuracy(acc);
    }

    if (value === sampleText) {
      setFinished(true);
    }

    setCaretIndex(value.length);
  };
  
  useEffect(() => {
    if (finished && localStorage.getItem('user')) {
      const user = JSON.parse(localStorage.getItem('user')!);
      console.log('Saving result:', { wpm, accuracy, username: user.name });
      fetch(`${API_URL}/api/typing-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wpm,
          accuracy,
          username: user.name
        })
      });
    }
  }, [finished]);


  /*

  useEffect(() => {
    if (!startTime) return;
    let endTime = Date.now();
    if (finished && input.length > 0) {
      endTime = startTime + (timeTotal - timeLeft) * 1000;
    }
    const elapsedMinutes = (endTime - startTime) / 1000 / 60;
    const words = input.trim().length === 0 ? 0 : input.trim().split(/\s+/).length;
    setWpm(elapsedMinutes > 0 ? Math.round(words / elapsedMinutes) : 0);
  }, [input, finished, startTime, timeLeft]);

  */
  useEffect(() => {
    inputRefLive.current = input;
  }, [input]);
  
  
  useEffect(() => {
    if (!startTime || finished) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > timeTotal) return;

      const elapsedMinutes = elapsed / 60;
      const liveInput = inputRefLive.current;
      const words = liveInput.trim().length === 0 ? 0 : liveInput.trim().split(/\s+/).length;
      const currentWpm = elapsedMinutes > 0 ? Math.round(words / elapsedMinutes) : 0;
      const currentAccuracy = total.current > 0 ? Math.round((correct.current / total.current) * 100) : 100;

      setHistory((prev) => [
        ...prev,
        { wpm: currentWpm, accuracy: currentAccuracy }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, finished]);

  const handleRestart = () => {
    correct.current = 0;
    total.current = 0;
    setAccuracy(100);
    setInput("");
    setStartTime(null);
    setWpm(0);
    setFinished(false);
    setTimeLeft(timeTotal);
    setHistory([]);
    inputRef.current?.focus();

    // Fetch new sample text
    const fetchSampleText = async () => {
      try {
        const response = await fetch(`${API_URL}/api/words`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const sample = _.sampleSize(data, 50).join(" ");
        setSampleText(sample);
      } catch (error) {
        console.error('Error fetching sample text:', error);
      }
    };
    fetchSampleText();
  };


  return (
    <div className={styles.container}>
      {finished ? (
        <div style={{ textAlign: 'center', marginTop: '3em' }}>
          <h1>Results</h1>
          <h2>Your WPM: {wpm}</h2>
          <h2>Accuracy: {accuracy}%</h2>
          <div style={{ maxWidth: 600, margin: "2em auto" }}>
            <ApexChart
              type="line"
              height={350}
              width={500}
              series={[
                {
                  name: "WPM",
                  data: history.map((h) => h.wpm),
                }
              ]}
              options={{
                chart: {
                  id: "typing-performance",
                  toolbar: { show: false },
                  background: 'transparent',
                },
                colors: ['#00adb5', '#fbbf24'], // WPM: blue, Accuracy: yellow
                xaxis: {
                  categories: history.map((_, i) => (i + 1).toString()),
                  title: { text: "Seconds", style: { color: '#ccc' } },
                  labels: { style: { colors: "#ccc" } },
                },
                yaxis: {
                  title: { text: "WPM", style: { color: '#ccc' } },
                  min: 0,
                  max: Math.max(...history.map(h => h.wpm)) + 20,
                  labels: { style: { colors: "#ccc" } },
                },
                stroke: {
                  curve: "smooth",
                  width: 3,
                },
                markers: {
                  size: 5,
                  colors: ['#00adb5', '#fbbf24'],
                  strokeColors: "#fff",
                  strokeWidth: 2,
                },
                tooltip: {
                  shared: true,
                  custom: ({ series, dataPointIndex }) => {
                    const second = dataPointIndex + 1;
                    const wpm = series[0][dataPointIndex] ?? 0;
                    const accuracy = history[dataPointIndex]?.accuracy ?? 0;
                    return `
                      <div style="padding: 8px; color: #000">
                        <strong>Second: ${second}</strong><br/>
                        WPM: <strong>${wpm}</strong><br/>
                        Accuracy: <strong>${accuracy}%</strong>
                      </div>
                    `;
                  },
                },
                grid: { borderColor: "#444" },
                legend: {
                  labels: { colors: '#ccc' }
                },
              }}
            />
          </div>
          <button onClick={handleRestart}><MdOutlineNavigateNext /></button>
        </div>
      ) : (
        <>
          <div
            className={styles.sample}
            style={{
              userSelect: 'none',
              marginBottom: 8,
              position: 'relative',
              minHeight: '2.5em',
              cursor: 'text',
            }}
            onClick={() => {
              inputRef.current?.focus();
              setInputFocused(true);
            }}
          >
            {renderSampleText()}
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleChange}
              rows={3}
              cols={60}
              disabled={finished}
              className={styles.textarea}
              placeholder="Start typing here..."
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
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={(e) => {
                if (finished && (e.key === "Tab" || e.key === "Enter")) {
                  e.preventDefault();
                  handleRestart();
                }
              }}
            />
            {!inputFocused && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(30,30,30,0.7)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.3em',
                  borderRadius: '12px',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => {
                  inputRef.current?.focus();
                  setInputFocused(true);
                }}
              >
                Click here to start typing
              </div>
            )}
          </div>
          <div>
            <strong>Time Left: {timeLeft}s</strong>
          </div>
          <div className={styles.result}>
            <p>WPM: {wpm}</p>
            <p>Accuracy: {accuracy}%</p>
          </div>
        </>
      )}
    </div>
  );
}

export default Typing;