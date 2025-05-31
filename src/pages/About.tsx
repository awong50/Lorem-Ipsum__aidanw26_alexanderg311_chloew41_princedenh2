import React, { useState } from "react";
const baseCardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #232931 80%, #393e46 100%)",
    color: "#eeeeee",
    borderRadius: "1.2rem",
    padding: "2.2rem",
    boxShadow: "0 4px 24px rgba(0, 173, 181, 0.13)",
    maxWidth: "650px",
    width: "100%",
    border: "2px solid #00adb5",
    transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
    cursor: "pointer",
};

const headerStyle: React.CSSProperties = {
  color: "#a3bffa",
  fontWeight: 700,
  fontSize: "2rem",
  marginBottom: "1rem",
  letterSpacing: "0.03em",
};

function HoverCard({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...baseCardStyle,
        boxShadow: hovered
          ? "0 8px 32px rgba(163,191,250,0.25)"
          : baseCardStyle.boxShadow,
        transform: hovered ? "translateY(-6px) scale(1.03)" : "none",
        borderColor: hovered ? "#a3bffa" : baseCardStyle.border as string,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

const About = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "2.5rem 10rem",
        maxWidth: "1100px",
        width: "100%",
      }}
    >
      <HoverCard>
        <h2 style={headerStyle}>Description</h2>
        <p style={{ fontSize: "1.15rem" }}>
          ProtoType is a typing game focused on improving speed and accuracy with a minimalistic design. It features a variety of typing tests, including LaTeX expressions, to help users practice and enhance their typing skills.
        </p>
      </HoverCard>
      <HoverCard>
        <h2 style={headerStyle}>Inspirations & Credits</h2>
        <p style={{ fontSize: "1.15rem" }}>
          Inspired heavily by the sites{" "}
          <a href="https://monkeytype.com" target="_blank" rel="noopener noreferrer" style={{ color: "#a3bffa", textDecoration: "underline" }}>
            Monkeytype
          </a>{" "}
          and{" "}
          <a href="https://texnique.xyz" target="_blank" rel="noopener noreferrer" style={{ color: "#a3bffa", textDecoration: "underline" }}>
            Texnique
          </a>.
        </p>
      </HoverCard>
      <HoverCard>
        <h2 style={headerStyle}>Word Set</h2>
        <p style={{ fontSize: "1.15rem" }}>
          The word set is based on the most common English words and the LaTeX expressions are pulled from a crowdsourced database.
        </p>
      </HoverCard>
      <HoverCard>
        <h2 style={headerStyle}>Keybinds</h2>
        <p style={{ fontSize: "1.15rem" }}>
          <strong>Tab/Enter</strong>: Move on to the next test (WPM)<br />
          <strong>Ctrl+C</strong>: Copy solution (on LaTeX page)<br />
        </p>
      </HoverCard>
    </div>
  </div>
);

export default About;