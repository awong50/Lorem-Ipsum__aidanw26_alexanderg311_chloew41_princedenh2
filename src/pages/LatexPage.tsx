import { useEffect, useRef } from 'react';
import { parse, HtmlGenerator } from 'latex.js';

const LatexPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const latexSource = `
    \\documentclass{article}
    \\begin{document}
    \\[\\zeta(s) = \\sum_{n \\geq 1} \\frac{1}{n^s} \\quad \\quad \\forall{s > 1}\\]
    \\[\\left(\\frac{\\int_0^\\infty e^{-x^2} \\, \\mathrm{d}x}{\\frac{\\sqrt\\pi}{2}}\\right) = 1 \\]
    \\end{document}
  `;

  useEffect(() => {
    const generator = new HtmlGenerator({ hyphenate: false });
    parse(latexSource, { generator });
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(generator.domFragment());
    }
  }, []);

  return (
    <div>
      <h1>Compiling LaTeX</h1>
      <div ref={containerRef}></div>
    </div>
  );
};

export default LatexPage;
