import React, { useState, useRef, useEffect } from "react";
import styles from '@css/Typing.module.css';

const sampleText = "The quick brown fox jumps over the lazy dog.";

const Typing = () => {
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100); // Reat Hooks: accuracy is state variable, setAccuracy is function to update it, useState<number>(100) initializes it to 0
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && !finished) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
        const words = input.trim().split(/\s+/).length;
        setWpm(elapsed > 0 ? Math.round(words / elapsed) : 0);
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, finished, input]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && !finished) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes passed since start (used for WPM)
        const words = input.trim().split(/\s+/).length;
        setWpm(elapsed > 0 ? Math.round(words / elapsed) : 0);
      }, 100); // Update the live number here (100 ms currently)
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, finished, input]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (!startTime && value.length === 1) {
        setStartTime(Date.now());
    }
    setInput(value);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
        if (value[i] === sampleText[i]) correct++;
    }
    const acc = value.length > 0 ? Math.round((correct / value.length) * 100) : 100;
    setAccuracy(acc);

    // Live update WPM on every keystroke
    if (startTime && !finished) {
        const elapsed = (Date.now() - startTime) / 1000 / 60;
        const words = value.trim().split(/\s+/).length;
        setWpm(elapsed > 0 ? Math.round(words / elapsed) : 0);
    }

    if (value === sampleText) {
        setFinished(true);
        if (startTime) {
        const timeTaken = (Date.now() - startTime) / 1000 / 60; // minutes
        const words = sampleText.split(" ").length;
        setWpm(Math.round(words / timeTaken));
        }
    }
  };

  const handleRestart = () => {
    setInput("");
    setStartTime(null);
    setWpm(0);
    setFinished(false);
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