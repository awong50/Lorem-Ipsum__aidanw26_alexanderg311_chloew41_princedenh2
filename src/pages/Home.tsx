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
  const [timeTotal, setTimeTotal] = useState(15); 
  const [timeLeft, setTimeLeft] = useState(15);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [sampleText, setSampleText] = useState<string>(""); // State to hold the sample text
  const [, setCaretIndex] = useState(0);
  const [inputFocused, setInputFocused] = useState(true);

  const [history, setHistory] = useState<{ wpm: number; accuracy: number }[]>([]);
  const inputRefLive = useRef<string>("");

  // Use refs for mutable counters
  const total = useRef(0);
  const correct = useRef(0);

  const MAX_CHARS_PER_LINE = 60;
  const scrollRef = useRef<HTMLDivElement>(null); 

  function splitToLines(text: string, maxChars: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      if ((currentLine + word).length + 1 > maxChars) {
        lines.push(currentLine);
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    return lines;
  }

  const fetchMoreWords = async () => {
    try {
      const response = await fetch(`${API_URL}/api/words`);
      const data = await response.json();
      setSampleText(prev => prev + " " + _.sampleSize(data, 50).join(" "));
    } catch (error) {
      console.error('Error fetching more words:', error);
    }
  };

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
        const sample = _.sampleSize(data, 50).join(" ");
        setSampleText(sample);
      } catch (error) {
        console.error('Error fetching sample text:', error);
      }
    };
    fetchSampleText();
  }, []); 

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
    
    if (sampleText.length - value.length < 30) fetchMoreWords();

    setCaretIndex(value.length);
  };

  useEffect(() => {
    const charsBefore = sampleText.slice(0, input.length);
    const currentLine = splitToLines(charsBefore, MAX_CHARS_PER_LINE).length - 1;
    const LINE_HEIGHT = 40;
    const scrollOffset = (currentLine - 1) * LINE_HEIGHT;
  
    if (scrollRef.current) {
      const maxScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      scrollRef.current.scrollTop = Math.min(scrollOffset, maxScroll);
    }
  }, [input]);
  
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

  useEffect(() => {
    inputRefLive.current = input;
  }, [input]);
  
  
  useEffect(() => {
    if (!startTime || finished) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= timeTotal) {
        setFinished(true);
        return;
      }

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

  const handleRestart = (customTime?: number) => {
    const newTime = customTime ?? timeTotal;
    correct.current = 0;
    total.current = 0;
    setAccuracy(100);
    setInput("");
    setStartTime(null);
    setWpm(0);
    setFinished(false);
    setTimeLeft(newTime);
    setTimeTotal(newTime);
    setHistory([]);
    inputRef.current?.focus();

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
      <div className={styles.controls} style={{ marginBottom: '1em', textAlign: 'center' }}>
        <label style={{ color: '#fff', marginRight: '0.5em' }}>Test Duration:</label>
        {[15, 30, 60, 120].map((sec) => (
          <button
            key={sec}
            onClick={() => handleRestart(sec)}
            style={{
              margin: '0 0.5em',
              padding: '0.3em 0.7em',
              backgroundColor: timeTotal === sec ? '#00adb5' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {sec}s
          </button>
        ))}
        <input
          type="number"
          min="5"
          placeholder="Custom"
          style={{
            marginLeft: '1em',
            padding: '0.3em',
            width: '60px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(val) && val >= 5) {
                handleRestart(val);
              }
            }
          }}
        />
    </div>
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
          <button onClick={() => handleRestart()}><MdOutlineNavigateNext /></button>
        </div>
      ) : (
        <>
            <div
              ref={scrollRef}
              
              style={{
                height: `${3 * 33}px`,
                overflowY: 'auto',
                lineHeight: '30px',
                padding: '10px',
                marginBottom: 8,
                position: 'relative',
                minHeight: '2.5em',
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none', 
              }}
            >
              {splitToLines(sampleText, MAX_CHARS_PER_LINE).map((line, lineIdx) => (
                <div key={lineIdx}>
                  {line.split('').map((char, charIdx) => {
                    const globalIdx = splitToLines(sampleText, MAX_CHARS_PER_LINE)
                      .slice(0, lineIdx)
                      .reduce((acc, l) => acc + l.length, 0) + charIdx;

                    const isActive = globalIdx === input.length;
                    const isCorrect = input[globalIdx] === char;
                    const hasTyped = globalIdx < input.length;

                    return (
                      <span key={charIdx} style={{
                        color: hasTyped ? (isCorrect ? '#fff' : '#f55') : '#555',
                        fontSize: '2em', // FONT SIZE
                        background: isActive ? '#fff4' : 'transparent',
                      }}>
                        {char}
                      </span>
                    );
                  })}
                </div>
              ))}
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
                  fontSize: '2.0em',
                  borderRadius: '100px',
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