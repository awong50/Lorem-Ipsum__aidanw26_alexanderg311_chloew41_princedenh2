import React from 'react';
import styles from '@css/Typing.module.css';

interface TypingRendererProps {
  input: string;
  sampleText: string;
  finished: boolean;
  charsPerLine?: number;
}

const TypingRenderer: React.FC<TypingRendererProps> = ({
  input,
  sampleText,
  finished,
  charsPerLine = 70,
}) => {
  const lines: string[] = [];
  let start = 0;

  while (start < sampleText.length) {
    let end = Math.min(start + charsPerLine, sampleText.length);
    if (end < sampleText.length && sampleText[end] !== ' ') {
      let lastSpace = sampleText.lastIndexOf(' ', end - 1);
      if (lastSpace > start) end = lastSpace;
    }
    lines.push(sampleText.slice(start, end).trim() + ' ');
    start = end;
    while (sampleText[start] === ' ') start++;
  }

  let charIndex = 0;
  let caretRendered = false;

  return (
    <span className={styles.renderedSampleWrapper}>
      {lines.map((line, lineIdx) => {
        const lineSpans = [];

        for (let i = 0; i < line.length; i++, charIndex++) {
          const char = line[i];
          let color = '#bbb';
          if (input.length > charIndex) {
            color = input[charIndex] === char ? '#fff' : '#f55';
          }

          const isCaretHere =
            !caretRendered &&
            (charIndex === input.length ||
              (i === line.length - 1 && charIndex + 1 === input.length)) &&
            !finished;

          if (isCaretHere) caretRendered = true;

          lineSpans.push(
            <span
              key={`${lineIdx}-${i}`}
              style={{
                color,
                fontFamily: 'monospace',
                fontSize: '1.4em',
                lineHeight: '1.4em',
                position: 'relative',
              }}
            >
              {char}
              {isCaretHere && (
                <span
                  className={styles.caret}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '2px',
                    height: '1.2em',
                    backgroundColor: '#fff',
                    animation: 'blink 1s step-end infinite',
                  }}
                />
              )}
            </span>
          );
        }

        return (
          <div key={lineIdx} style={{ display: 'block', minHeight: '1.4em' }}>
            {lineSpans}
          </div>
        );
      })}
    </span>
  );
};

export default TypingRenderer;