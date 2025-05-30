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

  const CHARS_PER_LINE = 70;

  const getLines = (text: string): string[] => { 
    const lines: string[] = []; 
    let start = 0; 
    while (start < text.length) { 
      let end = Math.min(start + CHARS_PER_LINE, text.length); 
      if (end < text.length && text[end] !== ' ') { 
        let lastSpace = text.lastIndexOf(' ', end - 1); 
        if (lastSpace > start) { 
          end = lastSpace; 
        } 
      } 
      lines.push(text.slice(start, end).trim() + ' '); 
      start = end; 
      while (text[start] === ' ') start++; 
    } 
    return lines; 
  }; 

  useEffect(() => {
    if (!finished) {
      inputRef.current?.focus();
    }
  }, [finished]);

  useEffect(() => {
    if (!startTime || finished) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= timeTotal) {
        setFinished(true);
        return;
      }

      const elapsedMinutes = elapsed / 60;
      const liveInput = inputRefLive.current.trim();
      const sampleWords = sampleText.trim().split(/\s+/);
      const inputWords = liveInput.split(/\s+/);

      // Count only fully correct words
      let correctWords = 0;
      for (let i = 0; i < inputWords.length; i++) {
        if (inputWords[i] === sampleWords[i]) {
          correctWords++;
        } else {
          break; // Stop at first incorrect word
        }
      }

      let currentWpm = 0;
      if (elapsed >= 1 && correctWords > 0) {
        currentWpm = Math.round(correctWords / elapsedMinutes);
      }

      const currentAccuracy = total.current > 0 ? Math.round((correct.current / total.current) * 100) : 100;

      setWpm(currentWpm); 
      setAccuracy(currentAccuracy);

      setHistory((prev) => [
        ...prev,
        { wpm: currentWpm, accuracy: currentAccuracy }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, finished, sampleText]);

  useEffect(() => {
    // Fetch sample text from the server
    const fetchSampleText = async () => {
      try {
        const response = await fetch(`${API_URL}/api/words`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const wordsCount = Math.max(10, Math.round((timeTotal / 3) * 10));
        const sample = _.sampleSize(data, wordsCount).join(" ");
        setSampleText(sample);
      } catch (error) {
        console.error('Error fetching sample text:', error);
      }
    };
    fetchSampleText();
  }, []); 

  useEffect(() => {
    if (!startTime || finished) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTimeLeft = Math.max(timeTotal - elapsed, 0);
      setTimeLeft(newTimeLeft);
      if (newTimeLeft <= 0) {
        setFinished(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, finished, timeTotal]);

  const renderSampleText = () => {
    const lines = getLines(sampleText);

    let charIndex = 0;
    let caretRendered = false;
    return (
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '100%',
          textAlign: 'left', 
        }}
      >
        {lines.map((line, lineIdx) => {
          const lineSpans = [];
          for (let i = 0; i < line.length; i++, charIndex++) {
            const char = line[i];
            let color = '#bbb';
            if (input.length > charIndex) {
              color = input[charIndex] === char ? '#fff' : '#f55';
            }
            const isCaretHere =
              !caretRendered &&
              (
                charIndex === input.length ||
                (i === line.length - 1 && charIndex + 1 === input.length)
              ) &&
              !finished;

            if (isCaretHere) caretRendered = true;

            lineSpans.push(
              <span
                key={`${lineIdx}-${i}`}
                style={{
                  color,
                  background: 'transparent',
                  transition: 'color 0.3s',
                  fontFamily: 'monospace',
                  fontSize: '1.4em',
                  lineHeight: '1.4em',
                  position: 'relative',
                }}
              >
                {char}
                {isCaretHere && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '0%',
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
          }
          if (
            !caretRendered &&
            input.length === charIndex &&
            !finished
          ) {
            caretRendered = true;
            lineSpans.push(
              <span
                key={`${lineIdx}-caret`}
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  width: '2px',
                  height: '1.2em',
                  verticalAlign: 'bottom',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '2px',
                    height: '1.2em',
                    backgroundColor: '#fff',
                    animation: 'blink 1s step-end infinite',
                  }}
                />
              </span>
            );
          }
          return (
            <div key={lineIdx} style={{ display: 'block', minHeight: '1.4em', textAlign: 'left' }}>
              {lineSpans}
            </div>
          );
        })}
      </span>
    );
  };

  const [wrongAfterSpace, setWrongAfterSpace] = useState<string[]>([]);
  const [wrongAfterSpaceIndex, setWrongAfterSpaceIndex] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return;

    let value = e.target.value;

    // Detect if we're at a space in the sample text
    const caretPos = value.length;
    const atSpace = sampleText[caretPos - 1] === " ";
    const prevCharIsSpace = sampleText[caretPos - 2] === " ";

    // If we are in a wrong-after-space state, enforce max 5 wrong chars
    if (wrongAfterSpaceIndex !== null && caretPos > wrongAfterSpaceIndex) {
      // Only allow up to 5 wrong chars after the space
      if (caretPos - wrongAfterSpaceIndex > 5) {
        // Ignore further input
        value = value.slice(0, wrongAfterSpaceIndex + 5);
      }
    }

    // If the user is at a space in the sample text, only allow a space to be typed
    if (
      caretPos > 0 &&
      sampleText[caretPos - 1] === " " &&
      value[caretPos - 1] !== " "
    ) {
      // Don't allow non-space at space position
      return;
    }

    // If the user just typed a wrong character after a space
    if (
      caretPos > 0 &&
      sampleText[caretPos - 1] === " " &&
      value[caretPos - 1] === " " &&
      value.length > input.length
    ) {
      // Reset wrongAfterSpace state
      setWrongAfterSpace([]);
      setWrongAfterSpaceIndex(null);
    } else if (
      caretPos > 0 &&
      sampleText[caretPos - 1] === " " &&
      value[caretPos - 1] !== " " &&
      value.length > input.length
    ) {
      // User typed wrong char after a space
      if (wrongAfterSpaceIndex === null) {
        setWrongAfterSpaceIndex(caretPos - 1);
        setWrongAfterSpace([value[caretPos - 1]]);
      } else if (caretPos - 1 === wrongAfterSpaceIndex + wrongAfterSpace.length) {
        setWrongAfterSpace((prev) => [...prev, value[caretPos - 1]]);
      }
      // Don't update input yet, wait for correction or up to 5 wrong chars
      if (wrongAfterSpace.length >= 5) return;
    } else if (
      wrongAfterSpaceIndex !== null &&
      caretPos <= wrongAfterSpaceIndex
    ) {
      // User backspaced to before the wrong-after-space region, reset
      setWrongAfterSpace([]);
      setWrongAfterSpaceIndex(null);
    }

    // Append wrong letters to sampleText for display
    let displaySampleText = sampleText;
    if (wrongAfterSpaceIndex !== null && wrongAfterSpace.length > 0) {
      displaySampleText =
        sampleText.slice(0, wrongAfterSpaceIndex + 1) +
        wrongAfterSpace.join("") +
        sampleText.slice(wrongAfterSpaceIndex + 1);
    }

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

    const container = document.getElementById('sampleTextContainer');
    const scroller = document.getElementById('sampleTextScroller');
    if (container && scroller) {
      const charsPerLine = CHARS_PER_LINE;
      const lineHeight = 47; 
      const caretPos = value.length;
      const currentLine = Math.floor(caretPos / charsPerLine);

      if (currentLine > 1) {
        const scrollY = (currentLine - 1) * lineHeight;
        scroller.style.transform = `translateY(-${scrollY}px)`;
      } else {
        scroller.style.transform = 'translateY(0px)';
      }
    }
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

    // Fetch new sample text
    const fetchSampleText = async () => {
      try {
        const response = await fetch(`${API_URL}/api/words`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const wordsCount = Math.max(10, Math.round((timeTotal / 3) * 30));
        const sample = _.sampleSize(data, wordsCount).join(" ");
        setSampleText(sample);
      } catch (error) {
        console.error('Error fetching sample text:', error);
      }
    };
    fetchSampleText();
  };

  const averageWpm =
  history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.wpm, 0) / history.length)
    : 0;


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
          <h2>Your WPM: {averageWpm}</h2>
          <h2>Accuracy: {accuracy}%</h2>
          <div style={{ maxWidth: 600, margin: "2em auto" }}>
            <ApexChart
              type="line"
              height={350}
              width={500}
              series={[
                {
                  name: "WPM",
                  data: Array.from({ length: timeTotal }, (_, i) => history[i]?.wpm ?? 0),
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
                  categories: Array.from({ length: timeTotal }, (_, i) => (i + 1).toString()),
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
            <div
              id="sampleTextContainer"
              style={{
                maxHeight: '5.1em', // SET HEIGHT HERE
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                scrollBehavior: 'smooth'
              }}
            >
              <div
                id="sampleTextScroller"
                style={{
                  transition: 'transform 0.4s ease',
                  willChange: 'transform',
                }}
              >
                {renderSampleText()}
              </div>
            </div>
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
                // Prevent navigation and editing commands
                if (
                  ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'].includes(e.key)
                ) {
                  e.preventDefault();
                  return;
                }
                // Prevent space unless at word boundary (already handled in handleChange)
                if (
                  e.key === ' ' &&
                  !(input.length < sampleText.length && sampleText[input.length] === ' ')
                ) {
                  e.preventDefault();
                  return;
                }
                // Prevent restart on Tab/Enter if finished (existing)
                if (finished && (e.key === "Tab" || e.key === "Enter")) {
                  e.preventDefault();
                  handleRestart();
                }
              }}
              onCopy={e => e.preventDefault()}
              onPaste={e => e.preventDefault()}
              onCut={e => e.preventDefault()}
              onContextMenu={e => e.preventDefault()}
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