
import React, { useState, useRef, useEffect, use } from "react";
import styles from '@css/Typing.module.css';
import _, { set } from 'lodash'; // Import lodash for sampling
import RandomWords from '../../server/data/RandomWords';
const Typing = () => {

  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100); // Reat Hooks: accuracy is state variable, setAccuracy is function to update it, useState<number>(100) initializes it to 0
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [sampleText, setSampleText] = useState<string>(""); // State to hold the sample text
  
  // Use refs for mutable counters
  const total = useRef(0);
  const correct = useRef(0);
  const incorrect = useRef(0);


  
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
  
  useEffect(() => {
    // Fetch sample text from the server
    const fetchSampleText = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/words');
        console.log(response);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const words = data.commonWords;
        const sample = _.sampleSize(words, 50).join(" "); // Sample 50 words
        setSampleText(sample);
      } catch (error) {
        console.error('Error fetching sample text:', error);
      }
    };
    fetchSampleText();
  }, []);  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

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

    // Calculate accuracy if new character is typed
    if (newCharacter) {
        if (!sampleText.includes(value)) {
          incorrect.current++;
        }
        if (value[value.length-1] === sampleText[value.length-1]) correct.current++;
        const acc = value.length > 0 ? Math.round((correct.current / total.current) * 100) : 100;
        setAccuracy(acc);
    }

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
    correct.current = 0;
    total.current = 0;
    setAccuracy(100);
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
