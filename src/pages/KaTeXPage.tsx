import { useEffect, useRef } from 'react';
import { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const LatexPage = () => {

  const [equation, setEquation] = useState<string>('');

  const handleInputChange = 
      (e: React.ChangeEvent<HTMLInputElement>) => {
          setEquation(e.target.value);
      };

  const containerRef = useRef<HTMLDivElement>(null);

  const latexSource = `
    \\zeta(s) = \\sum_{n \\geq 1} \\frac{1}{n^s} \\quad \\quad \\forall{s > 1}
    \\left(\\frac{\\int_0^\\infty e^{-x^2} \\, \\mathrm{d}x}{\\frac{\\sqrt\\pi}{2}}\\right) = 1
    \\zeta(3) = \\frac{5}{2} \\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n^3 \\binom{2n}{n}}
  `;

  const sampleEquation1 = '\\zeta(s) = \\sum_{n \\geq 1} \\frac{1}{n^s} \\quad \\quad \\forall{s > 1}'
  const sampleEquation2 = '\\left(\\frac{\\int_0^\\infty e^{-x^2} \\, \\mathrm{d}x}{\\frac{\\sqrt\\pi}{2}}\\right) = 1'
  const sampleEquation3 = '\\zeta(3) = \\frac{5}{2} \\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n^3 \\binom{2n}{n}}'

  useEffect(() => {
    if (containerRef.current && equation) {
      containerRef.current.innerHTML = ''; // Clear previous content
      
      /*
      latexSource.split('\n').forEach((line) => {
        if (line.trim()) {
          const equationElement = document.createElement('div');
          katex.render(line.trim(), equationElement, {
            throwOnError: false,
            displayMode: true, // Render in display mode
          });
          containerRef.current?.appendChild(equationElement);
      */

      const equationElement = document.createElement('div');
      katex.render(equation, equationElement, {
        throwOnError: false,
        displayMode: true, // Render in display mode
      });
      containerRef.current?.appendChild(equationElement);
    }
  }, [equation]);

  return (
    <div>
      <h1>Compiling LaTeX with KaTeX</h1>
      <div>
        <input type="text" value={equation}
          onChange={handleInputChange}
          style={{ width: '100%', height: '30px' }} 
          placeholder="Enter equation" />
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
