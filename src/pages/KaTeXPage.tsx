import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from '@css/KaTeX.module.css';

// Custom tab instead of \t because we think it looks nicer (four spaces)
const TAB = '    '; 

const formulas: string[] = [
  '\\zeta(s) = \\sum_{n \\geq 1} \\frac{1}{n^s} \\quad \\quad \\forall{s > 1}',
  '\\left(\\frac{\\int_0^\\infty e^{-x^2} \\mathrm{d}x}{\\frac{\\sqrt\\pi}{2}}\\right) = 1',
  '\\zeta(3) = \\frac{5}{2} \\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n^3 \\binom{2n}{n}}'
];

const LatexPage = () => {

  const [finished, setFinished] = useState(false);
  const [shownSol, setShownSol] = useState(false);

  const [equation, setEquation] = useState<string>('');

  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const [targetEquation, setTargetEquation] = useState<string>('');

  useEffect(() => {
    const index = Math.floor(Math.random() * formulas.length);
    setTargetEquation(formulas[index]);
  }, []);

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

  var html = "";

  function cleanUp(str: string) {
    try {
        html = katex.renderToString(str);
        const noLB = str.replace(/[{]/g, "");
        const noRB = noLB.replace(/[}]/g, "");
        return noRB.replace(/ /g, "");
    }
    catch (e) {
        if (e instanceof katex.ParseError) {
            // KaTeX can't parse the expression
            html = ("Error in LaTeX '" + str + "': " + e.message)
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return(html)
        }
    }
  }

  // function copy() {
  //   console.log(targetEquation);
  //   var copyText = targetEquation;
  //   copyText.select();
  //   navigator.clipboard.writeText(copyText.value);
  //   alert("Copied the text: " + copyText.value);
  // } 

  const handleInputChange = 
    // AreaElement allows the inputted string to be in the form of a text box
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {

    if (!startTime) {
        setStartTime(Date.now());
    }

    setEquation(e.target.value);

    if (cleanUp(e.target.value) === cleanUp(targetEquation)) {
        setFinished(true);
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
      katex.render(targetEquation, equationElement, {
        throwOnError: false,
        displayMode: true,
      });
      targetRef.current.appendChild(equationElement);
    }
  }, [targetEquation]);

  const handleRestart = () => {
    const index = Math.floor(Math.random() * formulas.length);
    setTargetEquation(formulas[index]);
    setEquation("");
    setStartTime(null);
    setElapsedTime(0);
    setFinished(false);
    setShownSol(false);
  };

  return (
    <div>
      <div className={styles.text}>
        <h1>LaTeX Test</h1>
      <p>
        <b>Create the following formula in LaTeX:</b>
      </p>
      </div>
      <div 
        className={styles.container}
        ref={targetRef} >
      </div>
      <div className={styles.text}>
        <p><b>Your output:</b></p>
      </div>
      <div 
        className={styles.container + (finished ? ' ' + styles.finished : '')}
        ref={containerRef}>
      </div>
      <div className={styles.text}>
        <p><b>Type here:</b></p>
      </div>
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
      <div className={styles.text}>
        <p><b>Time Elapsed:</b> {Math.round(elapsedTime)}s</p>
      </div>
      <div className={styles.buttons}>
        <div className={styles.button1}>{<button onClick={handleRestart}>Skip</button>}</div>
        {!finished && !shownSol && <button onClick={() => setShownSol(true)}>Show Solution</button>}
        {!finished && shownSol && <button onClick={() => setShownSol(false)}>Hide Solution</button>}
        {shownSol && (<p><b>Solution:</b> {targetEquation}</p>)}
        {/* {<button onClick={copy}>Copy Solution</button>} */}
      </div>
    </div>
  );
};

export default LatexPage;
