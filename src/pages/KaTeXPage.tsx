import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const TAB = '    '; 

const LatexPage = () => {
  const [equation, setEquation] = useState<string>('');

  const handleInputChange = 
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setEquation(e.target.value);
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
      <h1>Compiling LaTeX with KaTeX</h1>
      <div>
        <textarea
          value={equation}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{ width: '100%', height: '80px', fontSize: '16px' }}
          placeholder="Start LaTeXing here..."
        />
        {/* <p>Input: {equation}</p> */}
      </div>
      <div ref={containerRef}></div>
      <p><b>Sample Equation 1:</b> {sampleEquation1}</p>
      <p><b>Sample Equation 2:</b> {sampleEquation2}</p>
      <p><b>Sample Equation 3:</b> {sampleEquation3}</p>
    </div>
  );
};

export default LatexPage;
