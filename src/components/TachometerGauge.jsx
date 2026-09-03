// src/components/TachometerGauge.jsx
// Formula 1 / GT3 tachometer — SVG needle + shift-light LEDs + redline physics

import { useEffect, useRef, useState } from 'react';

// 270° arc: starts at 225° (7 o'clock), ends at 495° = 135° (5 o'clock)
const START_DEG = 225;
const TOTAL_DEG = 270;
const R = 110;          // outer arc radius
const CX = 140;
const CY = 148;
const VIEW = 280;       // viewBox size

function degToRad(d) { return (d * Math.PI) / 180; }

function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = degToRad(startDeg);
  const e = degToRad(endDeg);
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

// Shift-light LED positions around the arc (9 pips)
function getLEDPositions(n = 9) {
  return Array.from({ length: n }, (_, i) => {
    const pct = (i + 0.5) / n;
    const deg = START_DEG + pct * TOTAL_DEG - 90; // offset for top arc
    const ledR = R + 18;
    return {
      x: CX + ledR * Math.cos(degToRad(START_DEG + pct * TOTAL_DEG)),
      y: CY + ledR * Math.sin(degToRad(START_DEG + pct * TOTAL_DEG)),
      pct: (i + 1) / n,
    };
  });
}

const LED_POSITIONS = getLEDPositions(9);

function getLEDColor(idx, regret) {
  // 0-2 → cyan, 3-5 → amber, 6-7 → orange, 8 → crimson
  const base = idx <= 2 ? '#00C6FF' : idx <= 5 ? '#F5A623' : idx <= 7 ? '#FF6B35' : '#FF2A54';
  const threshold = (idx + 1) / 9 * 100;
  const active = regret >= threshold;
  return { base, active };
}

// Needle endpoint given angle in degrees
function needlePoint(angleDeg, length) {
  const r = degToRad(angleDeg);
  return { x: CX + length * Math.cos(r), y: CY + length * Math.sin(r) };
}

const TICKS = Array.from({ length: 11 }, (_, i) => i * 10); // 0,10,20,...,100

export default function TachometerGauge({ regret, accentColor, statusLabel }) {
  // Spring physics for needle angle
  const [displayedRegret, setDisplayedRegret] = useState(regret);
  const springRef = useRef({ val: regret, vel: 0 });
  const rafRef    = useRef(null);
  const targetRef = useRef(regret);

  useEffect(() => {
    targetRef.current = regret;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const stiffness = 180;
    const damping   = 18;
    const mass      = 1;
    let last = performance.now();

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const spring = springRef.current;
      const force  = -stiffness * (spring.val - targetRef.current) - damping * spring.vel;
      spring.vel  += (force / mass) * dt;
      spring.val  += spring.vel * dt;

      setDisplayedRegret(Math.max(0, Math.min(99.999, spring.val)));

      if (Math.abs(spring.val - targetRef.current) > 0.02 || Math.abs(spring.vel) > 0.1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        spring.val = targetRef.current;
        spring.vel = 0;
        setDisplayedRegret(targetRef.current);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [regret]);

  const needleAngleDeg = START_DEG + (displayedRegret / 100) * TOTAL_DEG;
  const needleTip      = needlePoint(needleAngleDeg, R - 12);
  const needleBase1    = needlePoint(needleAngleDeg + 90, 10);
  const needleBase2    = needlePoint(needleAngleDeg - 90, 10);

  // Redline shudder (>88%)
  const shudder = displayedRegret > 88;
  // Blink 9th LED at >92%
  const [blinkOn, setBlinkOn] = useState(true);
  useEffect(() => {
    if (displayedRegret <= 92) { setBlinkOn(true); return; }
    const t = setInterval(() => setBlinkOn(b => !b), 120);
    return () => clearInterval(t);
  }, [displayedRegret > 92]);

  // Color of live arc
  const arcStartAngle = START_DEG;
  const arcEndAngle   = START_DEG + (displayedRegret / 100) * TOTAL_DEG;

  return (
    <div
      className="relative flex flex-col items-center"
      style={shudder ? { animation: 'shudder 0.08s linear infinite' } : {}}
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width="100%"
        style={{ maxWidth: '320px', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00C6FF" />
            <stop offset="50%"  stopColor="#F5A623" />
            <stop offset="80%"  stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#FF2A54" />
          </linearGradient>
          <filter id="ledGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="needleGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            @keyframes shudder {
              0%   { transform: translate(0,0); }
              25%  { transform: translate(1px, 0.5px); }
              50%  { transform: translate(-1px, -0.5px); }
              75%  { transform: translate(1px, -0.5px); }
              100% { transform: translate(-1px, 0.5px); }
            }
          `}</style>
        </defs>

        {/* Background ring */}
        <path d={arcPath(CX, CY, R, START_DEG, START_DEG + TOTAL_DEG)}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />

        {/* Live coloured arc */}
        {displayedRegret > 0.5 && (
          <path d={arcPath(CX, CY, R, arcStartAngle, arcEndAngle)}
            fill="none" stroke="url(#arcGrad)" strokeWidth="14" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }}
          />
        )}

        {/* Tick marks */}
        {TICKS.map(pct => {
          const angleDeg = START_DEG + (pct / 100) * TOTAL_DEG;
          const inner    = needlePoint(angleDeg, R - 22);
          const outer    = needlePoint(angleDeg, R - 10);
          const label    = needlePoint(angleDeg, R - 34);
          const isMajor  = pct % 25 === 0;
          return (
            <g key={pct}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke={isMajor ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isMajor ? 2 : 1} />
              {isMajor && (
                <text x={label.x} y={label.y + 4}
                  fill="rgba(255,255,255,0.35)"
                  fontSize="9" textAnchor="middle"
                  fontFamily="'Space Mono', monospace">
                  {pct}
                </text>
              )}
            </g>
          );
        })}

        {/* Shift-light LED pips */}
        {LED_POSITIONS.map((led, i) => {
          const { base, active } = getLEDColor(i, displayedRegret);
          const isNinth    = i === 8;
          const visiblyOn  = active && (!isNinth || blinkOn);
          return (
            <circle key={i}
              cx={led.x} cy={led.y} r={5}
              fill={visiblyOn ? base : 'rgba(255,255,255,0.06)'}
              stroke={visiblyOn ? base : 'rgba(255,255,255,0.1)'}
              strokeWidth="1"
              filter={visiblyOn ? 'url(#ledGlow)' : undefined}
              style={{ transition: 'fill 0.12s' }}
            />
          );
        })}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={accentColor}
          filter="url(#needleGlow)"
          style={{ transition: 'none' }}
        />
        {/* Hub cap */}
        <circle cx={CX} cy={CY} r={10} fill="#0E1117" stroke={accentColor} strokeWidth="2" />
        <circle cx={CX} cy={CY} r={4}  fill={accentColor}
          style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }} />

        {/* Centre readout */}
        <text x={CX} y={CY + 38}
          textAnchor="middle" fill="white"
          fontSize="26" fontFamily="'Space Mono', monospace" fontWeight="700"
          letterSpacing="-0.5">
          {displayedRegret.toFixed(1)}%
        </text>
        <text x={CX} y={CY + 54}
          textAnchor="middle" fill={accentColor}
          fontSize="7.5" fontFamily="'Space Mono', monospace"
          letterSpacing="2">
          {statusLabel}
        </text>
      </svg>
    </div>
  );
}
