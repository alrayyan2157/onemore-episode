// src/components/TransmissionConsole.jsx
// Typewriter terminal — Tomorrow You messages, tiered by regret level

import { useEffect, useRef, useState } from 'react';

const MESSAGES = {
  0: [
    '[SIGNAL NOMINAL // UPLINK: SECURE-Q7]',
    'Tomorrow You is mildly optimistic,',
    'though slightly suspicious of your',
    'decision-making capabilities.',
    'Coffee: Optional.  Risk: Acceptable.',
  ],
  1: [
    '[WARNING // MILD TEMPORAL DEBT DETECTED]',
    'Tomorrow You has pre-ordered an extra',
    'espresso and quietly cancelled the',
    'morning gym session. You are forgiven.',
    'Barely.',
  ],
  2: [
    '[CRITICAL // COGNITIVE COLLAPSE IMMINENT]',
    'Tomorrow You is staring blankly at the',
    'shower wall at 7:04 AM wondering who',
    'granted you access to a streaming service.',
    'The meeting starts in 53 minutes.',
  ],
  3: [
    '[ERROR // TRANSMISSION LOST]',
    '████ ██ ███████ ████ ██████████',
    'Tomorrow You has entered full cognitive',
    'bankruptcy. Signal degraded beyond',
    'recovery threshold. Nothing can fix this.',
  ],
};

export default function TransmissionConsole({ txTier, accentColor, now }) {
  const [lines,      setLines]      = useState([]);
  const [curLine,    setCurLine]    = useState('');
  const [lineIdx,    setLineIdx]    = useState(0);
  const [charIdx,    setCharIdx]    = useState(0);
  const prevTierRef                 = useRef(txTier);
  const timerRef                    = useRef(null);

  // Reset on tier change
  useEffect(() => {
    if (prevTierRef.current !== txTier) {
      prevTierRef.current = txTier;
      clearTimeout(timerRef.current);
      setLines([]); setCurLine(''); setLineIdx(0); setCharIdx(0);
    }
  }, [txTier]);

  useEffect(() => {
    const msgs = MESSAGES[txTier] || MESSAGES[0];
    if (lineIdx >= msgs.length) return;
    const line = msgs[lineIdx];

    if (charIdx < line.length) {
      timerRef.current = setTimeout(() => {
        setCurLine(line.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, txTier === 3 && lineIdx === 1 ? 45 : 22);
    } else {
      timerRef.current = setTimeout(() => {
        setLines(prev => [...prev, line]);
        setCurLine(''); setLineIdx(l => l + 1); setCharIdx(0);
      }, 380);
    }
    return () => clearTimeout(timerRef.current);
  }, [txTier, lineIdx, charIdx]);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div style={{
      background: 'rgba(0,0,0,0.65)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      fontFamily: 'var(--font-mono)',
      fontSize: 11.5,
      lineHeight: 1.7,
      color: 'rgba(0,245,212,0.85)',
      padding: '0.85rem 1.1rem',
      minHeight: 90,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* CRT scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 4px)',
        pointerEvents: 'none',
      }}/>

      <div style={{ display: 'flex', gap: 12, marginBottom: 6, opacity: 0.5 }}>
        <span style={{ fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: accentColor }}>◉ REC</span>
        <span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>UPLINK: SECURE-Q7</span>
        <span style={{ marginLeft: 'auto', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{timeStr}</span>
      </div>

      {lines.map((l, i) => (
        <div key={i} style={{
          color: i === 0 ? accentColor : 'rgba(226,232,240,0.72)',
          fontWeight: i === 0 ? 700 : 400,
          position: 'relative', zIndex: 1,
        }}>{l}</div>
      ))}

      {lineIdx < (MESSAGES[txTier]||[]).length && (
        <div style={{
          color: lineIdx === 0 ? accentColor : 'rgba(226,232,240,0.72)',
          fontWeight: lineIdx === 0 ? 700 : 400,
          position: 'relative', zIndex: 1,
        }}>
          {curLine}
          <span style={{ animation: 'blink-cur 1s step-end infinite' }}>_</span>
        </div>
      )}

      <style>{`@keyframes blink-cur{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}
