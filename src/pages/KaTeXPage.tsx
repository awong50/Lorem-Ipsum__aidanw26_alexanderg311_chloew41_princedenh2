import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from '@css/KaTeX.module.css';

//custom tab instead of \t because we think it looks nicer (four spaces)
const TAB = '    '; 

const LatexPage = () => {
  const [equation, setEquation] = useState<string>('');

  const handleInputChange = 
      //AreaElement allows the inputted string to be in the form of a text box
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setEquation(e.target.value);
      };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //makes pressing tab add a tab
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

  const sampleEquation1 = '\\zeta(s) = \\sum_{n \\geq 1} \\frac{1}{n^s} \\quad \\quad \\forall{s > 1}'
  const sampleEquation2 = '\\left(\\frac{\\int_0^\\infty e^{-x^2} \\, \\mathrm{d}x}{\\frac{\\sqrt\\pi}{2}}\\right) = 1'
  const sampleEquation3 = '\\zeta(3) = \\frac{5}{2} \\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n^3 \\binom{2n}{n}}'

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

  return (
    <div>
      <h1>LaTeX Test</h1>
      <p>
        <strong>Create the following formula in LaTeX:</strong>
      </p>
      <p>
        {sampleEquation1}
      </p>
      <p>
        <strong>Your output:</strong>
      </p>
      <div className={styles.container} ref={containerRef}></div>
      <p>
        <strong>Type here:</strong>
      </p>
      <div>
        <textarea
          value={equation}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{ width: '755px', height: '80px', fontSize: '15px', marginLeft: '30px' }}
          placeholder="Start LaTeXing here..."
        />
      </div>
      <p><b>Sample Equation 1:</b> {sampleEquation1}</p>
      <p><b>Sample Equation 2:</b> {sampleEquation2}</p>
      <p><b>Sample Equation 3:</b> {sampleEquation3}</p>
    </div>
  );
};

export default LatexPage;
