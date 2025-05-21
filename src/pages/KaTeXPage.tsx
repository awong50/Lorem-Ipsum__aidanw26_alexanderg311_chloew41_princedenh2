import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from '@css/KaTeX.module.css';

// Custom tab instead of \t because we think it looks nicer (four spaces)
const TAB = '    '; 

const LatexPage = () => {

  const [finished, setFinished] = useState(false);
  const [givenUp, setGivenUp] = useState(false);

  const [equation, setEquation] = useState<string>('');

  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && !finished) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        setElapsedTime(elapsed);
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, finished]);

  const sampleEquation1 = '\\zeta(s) = \\sum_{n \\geq 1} \\frac{1}{n^s} \\quad \\quad \\forall{s > 1}'
  const sampleEquation2 = '\\left(\\frac{\\int_0^\\infty e^{-x^2} \\, \\mathrm{d}x}{\\frac{\\sqrt\\pi}{2}}\\right) = 1'
  const sampleEquation3 = '\\zeta(3) = \\frac{5}{2} \\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n^3 \\binom{2n}{n}}'

  const handleInputChange = 
      // AreaElement allows the inputted string to be in the form of a text box
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {

      if (!startTime) {
          setStartTime(Date.now());
      }

      setEquation(e.target.value);

      if (e.target.value === sampleEquation1) {
          setFinished(true);
          console.log("done!");
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Makes pressing tab key indent code
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = equation.substring(0, start) + TAB + equation.substring(end);
      setEquation(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + TAB.length;
      }, 0);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && equation) {
      containerRef.current.innerHTML = '';

      const equationElement = document.createElement('div');
      katex.render(equation, equationElement, {
        throwOnError: false,
        displayMode: true,
      });
      containerRef.current?.appendChild(equationElement);
    }
    else {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  }, [equation]);

  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.innerHTML = '';
      const equationElement = document.createElement('div');
      katex.render(sampleEquation1, equationElement, {
        throwOnError: false,
        displayMode: true,
      });
      targetRef.current.appendChild(equationElement);
    }
  }, []);

  const handleRestart = () => {
    setEquation("");
    setStartTime(null);
    setElapsedTime(0);
    setFinished(false);
    setGivenUp(false);
  };

  return (
    <div>
      <h1>LaTeX Test</h1>
      <p>
        <b>Create the following formula in LaTeX:</b>
      </p>
      <div 
        className={styles.container}
        ref={targetRef} >
      </div>
      <p>
        <b>Your output:</b>
      </p>
      <div 
        className={styles.container}
        ref={containerRef}>
      </div>
      <p>
        <b>Type here:</b>
      </p>
      <div>
        <textarea
          value={equation}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{ width: '755px', height: '80px', fontSize: '15px', marginLeft: '30px' }}
          disabled={finished}
          placeholder="Start LaTeXing here..."
        />
      </div>
      <p><b>Time Elapsed:</b> {Math.round(elapsedTime)}s</p>
      <div>
        {finished && <button onClick={handleRestart}>Restart</button>}
      </div>
      <div>
        {!finished && <button onClick={() => setGivenUp(true)}>Show Solution</button>}
      </div>
      <div>
        {givenUp && (<p><b>Solution:</b> {sampleEquation1}</p>)}
      </div>
      {/* <p><b>Sample Equation 1:</b> {sampleEquation1}</p> */}
      {/* <p><b>Sample Equation 2:</b> {sampleEquation2}</p> */}
      {/* <p><b>Sample Equation 3:</b> {sampleEquation3}</p> */}
    </div>
  );
};

export default LatexPage;
