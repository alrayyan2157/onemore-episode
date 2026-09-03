// src/components/OdometerDisplay.jsx
// Rolling digit odometer for regret percentage

import { useEffect, useRef, useState } from 'react';

function AnimatedDigit({ digit, size }) {
  const [displayed, setDisplayed] = useState(digit);
  const [prev, setPrev] = useState(digit);
  const ref = useRef(null);

  useEffect(() => {
    if (digit !== displayed) {
      setPrev(displayed);
      setDisplayed(digit);
    }
  }, [digit]);

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1,
        width: size === '64px' ? '42px' : size === '40px' ? '26px' : '18px',
        textAlign: 'center',
        overflow: 'hidden',
        height: size,
        verticalAlign: 'bottom',
        position: 'relative',
      }}
    >
      <span
        ref={ref}
        style={{
          display: 'block',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          transform: 'translateY(0)',
        }}
      >
        {displayed}
      </span>
    </span>
  );
}

export default function OdometerDisplay({ value, accentColor }) {
  // Format: "74.819"
  const str = value.toFixed(3);
  const chars = str.split(''); // individual chars including '.'

  return (
    <div className="flex items-baseline justify-center select-none" style={{ lineHeight: 1 }}>
      {chars.map((ch, i) => {
        if (ch === '.') {
          return (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '40px',
              fontWeight: 700,
              color: accentColor,
              opacity: 0.7,
              lineHeight: 1,
              marginBottom: '2px',
            }}>.</span>
          );
        }
        return (
          <AnimatedDigit
            key={i}
            digit={ch}
            size={i < str.indexOf('.') ? '64px' : '40px'}
          />
        );
      })}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '36px',
        fontWeight: 400,
        color: accentColor,
        opacity: 0.5,
        marginLeft: '4px',
        lineHeight: 1,
      }}>%</span>
    </div>
  );
}
