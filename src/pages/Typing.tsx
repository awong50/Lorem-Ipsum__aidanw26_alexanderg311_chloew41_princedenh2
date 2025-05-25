import React, { useState, useRef, useEffect} from "react";
import styles from '@css/Typing.module.css';
import _ from 'lodash'; // Import lodash for sampling

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

  // Use refs for mutable counters
  const total = useRef(0);
  const correct = useRef(0);

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
        const response = await fetch('http://localhost:3000/api/words');
        console.log(response);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log(data);
        const sample = _.sampleSize(data, 50).join(" "); // Sample 50 words
        console.log(sample);
        setSampleText(sample);
      } catch (error) {
        console.error('Error fetching sample text:', error);
      }
    };
    fetchSampleText();
  }, []); 

  const renderSampleText = () => {
    return (
      <span>
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
                background: input.length === idx ? '#333' : 'transparent', // optional: highlight current letter
                transition: 'color 0.1s',
                fontFamily: 'monospace',
                fontSize: '1.2em',
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return;

    const value = e.target.value;
    console.log(value);

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
  };
  
  useEffect(() => {
    if (finished && localStorage.getItem('user')) {
      const user = JSON.parse(localStorage.getItem('user')!);
      console.log('Saving result:', { wpm, accuracy, username: user.name });
      fetch('/api/typing-result', {
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

  const handleRestart = () => {
    correct.current = 0;
    total.current = 0;
    setAccuracy(100);
    setInput("");
    setStartTime(null);
    setWpm(0);
    setFinished(false);
    setTimeLeft(timeTotal);
    inputRef.current?.focus();
  };

  return (
  <div className={styles.container}>
    <h1>Typing Speed Test</h1>
    <p>
      <strong>Type the following text:</strong>
    </p>
    <div
      className={styles.sample}
      style={{
      userSelect: 'none',
      marginBottom: 8,
      position: 'relative',
      minHeight: '2.5em', // ensures enough height for textarea overlay
      cursor: 'text', // This ensures the cursor stays as 'text' always
      }}
      onClick={() => inputRef.current?.focus()}
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
      />
    </div>
    <div>
      <strong>Time Left: {timeLeft}s</strong>
    </div>
    <div className={styles.result}>
      {finished ? (
        <>
          <h2>Your WPM: {wpm}</h2>
          <h2>Accuracy: {accuracy}%</h2>
          <button onClick={handleRestart}>Restart</button>
        </>
      ) : (
        <>
          <p>WPM: {wpm}</p>
          <p>Accuracy: {accuracy}%</p>
        </>
      )}
    </div>
  </div>
);
};

export default Typing;