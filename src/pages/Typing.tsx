import React, { useState, useRef, useEffect } from "react";
import styles from '@css/Typing.module.css';

const Typing = () => {
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [finished, setFinished] = useState(false);
  const timeTotal = 15;
  const [timeLeft, setTimeLeft] = useState(timeTotal); // Countdown
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const total = useRef(0);
  const correct = useRef(0);

  const sampleText = "The quick brown fox jumps over the lazy dog.";

  // Countdown timer effect
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
  };

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
      <div className={styles.sample}>
        {sampleText}
      </div>
      <div>
        <strong>Time Left: {timeLeft}s</strong>
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
      />
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