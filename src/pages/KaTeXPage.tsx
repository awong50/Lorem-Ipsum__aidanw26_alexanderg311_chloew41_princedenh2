import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from '@css/KaTeX.module.css';
import CustomTimeModal from '../components/CustomTimeModal';
import { MdOutlineNavigateNext } from "react-icons/md";

const API_URL = import.meta.env.VITE_API_URL;
const TAB = '    '; 

const formulas: string[] = [
  '\\zeta(s) = \\sum_{n \\geq 1} \\frac{1}{n^s} \\quad \\quad \\forall{s > 1}',
  '\\left(\\frac{\\int_0^\\infty e^{-x^2} \\mathrm{d}x}{\\frac{\\sqrt\\pi}{2}}\\right) = 1',
  '\\zeta(3) = \\frac{5}{2} \\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n^3 \\binom{2n}{n}}',
  'P=\\frac{RT}{V-b}-\\frac{a}{V^2}',
  'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e ^{-\\frac{1}{2}\\left({\\frac{x - \\mu}{\\sigma}}\\right)^2}',
  '\\oiint_{\\mathrm{d}\\Omega} \\mathbf{F} \\cdot \\mathrm{d}\\mathbf{S} = \\iiint_{\\Omega} \\mathrm{div}(\\mathbf{F}) \\mathrm{d}\\Omega',
  '\\oint_\\gamma \\mathbf{F} \\cdot \\mathrm{d}\\mathbf{r} = \\iint_\\Omega (\\nabla \\times \\mathbf{F}) \\cdot \\mathrm{d}\\mathbf{\\Omega}',
  '\\phi = \\oint \\mathbf{E} \\cdot \\mathrm{d} \\mathbf{s} = \\frac{Q_{enc}}{\\varepsilon_0}',
  'Q(t) = CV_0\\left(1-e^{-\\frac{t}{RC}}\\right)'
]

const DEFAULT_TIMES = [60, 120, 180, 300];

const KaTeXPage = () => {
  const [finished, setFinished] = useState(false);
  const [shownSol, setShownSol] = useState(false);
  const [, setUsedSol] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [equation, setEquation] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(180);
  const [targetEquation, setTargetEquation] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const [flashGreen, setFlashGreen] = useState(false);

  const [skipped, setSkipped] = useState(0);
  const [shownSolutions, setShownSolutions] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // For time selection UI
  useEffect(() => {
    const index = Math.floor(Math.random() * formulas.length);
    setTargetEquation(formulas[index]);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && !finished) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(elapsed);
        if (elapsed >= totalTime) {
          setFinished(true);
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, finished, totalTime]);

  // Saves result to server
  useEffect(() => {
    if (finished && localStorage.getItem('user')) {
      const user = JSON.parse(localStorage.getItem('user')!);
      fetch(`${API_URL}/api/latex-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.name,
          score,
          time: totalTime,
          skipped,
          shownSolutions,
          totalQuestions,
        }),
      }).catch((err) => console.error('Failed to save LaTeX result:', err));
    }
  }, [finished]);

  // Reset everything for a new test
  const handleRestart = (customTime?: number) => {
    const index = Math.floor(Math.random() * formulas.length);
    setTargetEquation(formulas[index]);
    setEquation('');
    setStartTime(null);
    setElapsedTime(0);
    setFinished(false);
    setShownSol(false);
    setUsedSol(false);
    setScore(0);
    setSkipped(0);
    setShownSolutions(0);
    setTotalQuestions(0);
    if (customTime) setTotalTime(customTime);
  };

  // When user skips, increment skipped and totalQuestions
  const handleSkip = () => {
    setSkipped(prev => prev + 1);
    setTotalQuestions(prev => prev + 1);
    const index = Math.floor(Math.random() * formulas.length);
    setTargetEquation(formulas[index]);
    setEquation('');
    setShownSol(false);
    setUsedSol(false);
  };

  // Handle time selection
  const handleTimeSelect = (sec: number) => {
    setTotalTime(sec);
    handleRestart(sec);
  };

  // KaTeX rendering helpers
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
    } else {
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

  // Input logic
  function cleanUp(str: string) {
    try {
      katex.renderToString(str);
      const noLB = str.replace(/[{]/g, "");
      const noRB = noLB.replace(/[}]/g, "");
      return noRB.replace(/ /g, "");
    }
    catch (e) {
      return "";
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startTime) setStartTime(Date.now());
    setEquation(e.target.value);

    if (cleanUp(e.target.value) === cleanUp(targetEquation)) {
      setFlashGreen(true);
      setScore(prev => prev + 1);
      setTotalQuestions(prev => prev + 1);
      setShownSol(false);
      setUsedSol(false);
      setTimeout(() => {
        const index = Math.floor(Math.random() * formulas.length);
        setTargetEquation(formulas[index]);
        setEquation('');
        setFlashGreen(false);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  // Show solution logic
  const showSolution = () => {
    if (!shownSol) setShownSolutions(prev => prev + 1);
    setShownSol(true);
    setUsedSol(true);
  };

  // Time controls UI
  const timeControls = (
    <div style={{ marginBottom: '1em', textAlign: 'center' }}>
      <label style={{ color: '#fff', marginRight: '0.5em' }}>Test Duration:</label>
      {DEFAULT_TIMES.map((sec) => (
        <button
          key={sec}
          onClick={() => handleTimeSelect(sec)}
          style={{
            margin: '0 0.5em',
            padding: '0.3em 0.7em',
            backgroundColor: totalTime === sec ? '#00adb5' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: totalTime === sec ? '0 0 8px #00adb5' : undefined,
            transition: 'box-shadow 0.2s',
            marginTop: '12em',
          }}
        >
          {sec}s
        </button>
      ))}
      <button
        onClick={() => setShowCustomModal(true)}
        style={{
          marginLeft: '0.5em',
          padding: '0.3em 0.7em',
          backgroundColor: !DEFAULT_TIMES.includes(totalTime) ? '#00adb5' : '#555',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          boxShadow: !DEFAULT_TIMES.includes(totalTime) ? '0 0 8px #00adb5' : undefined,
          transition: 'box-shadow 0.2s'
        }}
      >
        Custom
      </button>
      {showCustomModal && (
        <CustomTimeModal
          onClose={() => setShowCustomModal(false)}
          onSubmit={(val) => handleTimeSelect(val)}
        />
      )}
    </div>
  );

  const showNavbarOverlay = startTime && !finished;

  return (
    <div>
      {showNavbarOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100px',
            background: '#2e2f34',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {startTime ? (
        <div
          style={{
            height: '240px',
            width: '200px',
            borderRadius: '8px',
            marginBottom: '1em',
          }}
        />
      ) : (
        timeControls
      )}

      {/* Results screen */}
      {finished ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginTop: '3em',
            gap: '2em',
            width: '100%',
          }}
        >
          {/* Left: Score and time */}
          <div
            style={{
              minWidth: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              color: '#fff',
              background: 'rgba(30,30,30,0.8)',
              borderRadius: 12,
              padding: '2em 1.5em',
              boxShadow: '0 2px 12px #0004',
              fontSize: '1.4em',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '2.2em', marginBottom: '0.5em' }}>
              {score}
              <span style={{ fontWeight: 400, fontSize: '0.5em', marginLeft: 8, color: '#aaa' }}>Score</span>
            </div>
            <div style={{ fontWeight: 500, fontSize: '1.2em', marginTop: '1.5em' }}>
              Time
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.7em', color: '#00adb5' }}>
              {totalTime}s
            </div>
            <button
              onClick={() => handleRestart()}
              style={{
                marginTop: '2em',
                background: '#00adb5',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.7em 1.2em',
                fontSize: '1em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MdOutlineNavigateNext size={24} />
              New Test
            </button>
          </div>
          {/* Right: Skipped and Show Solution */}
          <div
            style={{
              minWidth: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              color: '#fff',
              background: 'rgba(30,30,30,0.8)',
              borderRadius: 12,
              padding: '2em 1.5em',
              boxShadow: '0 2px 12px #0004',
              fontSize: '1.2em',
            }}
          >
            <div style={{ marginBottom: '1em', fontWeight: 600, fontSize: '1.2em' }}>
              <b>Skipped:</b> {skipped}
            </div>
            <div style={{ marginBottom: '1em', fontWeight: 600, fontSize: '1.2em' }}>
              <b>Show Solution:</b> {shownSolutions}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '1.5em',
              fontWeight: 600,
              color: '#fff',
              width: '100%',
              maxWidth: 1700,
              marginTop: '2em',
              marginBottom: '-6em',
              marginLeft: '28em',
            }}
          >
            <div>
              {startTime && !finished && (
                <strong>{Math.max(0, totalTime - Math.round(elapsedTime))}</strong>
              )}
            </div>
            <div style={{ fontWeight: 400, fontSize: '0.9em', color: '#00adb5', marginRight: '23em' }}>
              <b>Score:</b> {score}
            </div>
          </div>
          <div className={styles.katexPageMain}>
            {/* Left Side */}
            <div
              className={styles.modelCard}
              style={{
                border: '2px solid #00adb5',
                borderRadius: '8px',
                background: '#23272f',
                boxShadow: '0 0 6px #222',
                width: '90%',
                minHeight: '8em',
                marginBottom: '1em',
              }}
            >
              <div className={styles.container} ref={targetRef}></div>
            </div>

            {/* Right Side*/}
            <div className={styles.rightCol}>
              <div
                className={styles.container + (finished ? ' ' + styles.finished : '')}
                ref={containerRef}
                style={{
                  width: '90%',
                  minHeight: '9em',
                  marginBottom: '1em',
                  border: flashGreen ? '2px solid #2ecc40' : '2px solid #00adb5',
                  borderRadius: '8px',
                  background: finished ? '#222831' : '#23272f',
                  boxShadow: finished ? '0 0 12px #00adb5' : flashGreen ? '0 0 6px #2ecc40' : '0 0 6px #222',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  marginTop: '-5em',
                }}
              ></div>
              <div className={styles.katexTextareaWrapper}>
                <textarea
                  value={equation}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={styles.katexTextarea}
                  disabled={finished}
                  placeholder="Start LaTeXing here..."
                  style={{
                    resize: 'none',
                    width: '100%',
                    minHeight: '6em',
                    maxHeight: '12em',
                    overflowY: 'auto',
                    border: flashGreen ? '2px solid #2ecc40' : '2px solid #00adb5',
                    boxShadow: finished ? '0 0 12px #00adb5' : flashGreen ? '0 0 6px #2ecc40' : '0 0 6px #222',
                  }}
                />
              </div>
                <div className={styles.buttons}>
                  <div style={{ display: 'flex', gap: '2em', minHeight: 40 }}>
                    {/* Skip Button Container */}
                    <div className={styles.button1} style={{ width: 100, height: 50 }}>
                      {startTime && !finished ? (
                        <button onClick={handleSkip} style={{ width: '100%', height: '100%' }}>Skip</button>
                      ) : (
                        <div style={{ width: '100%', height: '100%' }}></div> // Empty placeholder
                      )}
                    </div>

                    {/* Show/Hide Solution Button Container */}
                    <div style={{ minWidth: 130, height: 50 }}>
                      {startTime && !finished && !shownSol && (
                        <button onClick={showSolution} style={{ width: '100%', height: '100%' }}>Show Solution</button>
                      )}
                      {startTime && !finished && shownSol && (
                        <button onClick={() => setShownSol(false)} style={{ width: '100%', height: '100%' }}>Hide Solution</button>
                      )}
                      {/* When startTime is false or finished is true, render placeholder */}
                      {(!startTime || finished) && (
                        <div style={{ width: '100%', height: '100%' }}></div>
                      )}
                    </div>
                  </div>
                {shownSol && (
                  <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                  }}
                  onClick={() => setShownSol(false)}
                  >
                  <div
                    style={{
                    background: '#23272f',
                    padding: '2em 2.5em',
                    borderRadius: 12,
                    boxShadow: '0 4px 24px #000a',
                    minWidth: 320,
                    maxWidth: '90vw',
                    color: '#fff',
                    position: 'relative',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ marginBottom: '1em', fontWeight: 600, fontSize: '1.2em' }}>
                    Solution
                    </div>
                    <div>
                    <span
                      style={{
                      display: 'block',
                      background: '#181a20',
                      borderRadius: 8,
                      padding: '1em',
                      fontSize: '1.1em',
                      wordBreak: 'break-word',
                      }}
                    >
                      {targetEquation}
                    </span>
                    </div>
                    <button
                    onClick={() => setShownSol(false)}
                    style={{
                      marginTop: '1.5em',
                      background: '#00adb5',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.5em 1.2em',
                      fontSize: '1em',
                      cursor: 'pointer',
                      display: 'block',
                      marginLeft: 'auto',
                    }}
                    >
                    Close
                    </button>
                  </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KaTeXPage;
