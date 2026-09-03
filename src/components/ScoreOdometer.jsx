// src/components/ScoreOdometer.jsx
// Dramatic counting-up animation — eases out at the end, changes color with regret level

import { useEffect, useRef, useState } from 'react';

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function ScoreOdometer({ value, accentColor }) {
  const [displayed, setDisplayed] = useState(value);
  const animRef     = useRef(null);
  const startRef    = useRef(null);
  const fromRef     = useRef(value);
  const toRef       = useRef(value);
  const DURATION    = 750;

  useEffect(() => {
    fromRef.current = displayed;
    toRef.current   = value;
    startRef.current = null;
    cancelAnimationFrame(animRef.current);

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = easeOutExpo(progress);
      const current  = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplayed(current);
      if (progress < 1) animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  const str    = displayed.toFixed(3);
  const parts  = str.split('.');
  const intPart   = parts[0];
  const decPart   = parts[1] || '000';

  return (
    <div style={{ lineHeight: 1 }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 0,
        color: accentColor,
        transition: 'color 0.5s ease',
      }}>
        <span className="score-display" style={{ color: accentColor, fontSize: 'clamp(4.5rem,11vw,9.5rem)' }}>
          {intPart}
        </span>
        <span style={{
          fontFamily: 'var(--font)',
          fontSize: 'clamp(2rem,5vw,4rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: accentColor,
          opacity: 0.55,
        }}>.</span>
        <span style={{
          fontFamily: 'var(--font)',
          fontSize: 'clamp(2rem,5vw,4rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: accentColor,
        }}>
          {decPart}
        </span>
        <span style={{
          fontFamily: 'var(--font)',
          fontSize: 'clamp(1.5rem,3.5vw,3rem)',
          fontWeight: 700,
          color: accentColor,
          opacity: 0.4,
          marginLeft: 6,
        }}>%</span>
      </div>
    </div>
  );
}
