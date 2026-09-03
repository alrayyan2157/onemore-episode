// src/components/CircularDial.jsx
// Oversized hybrid alarm clock: draggable outer ring + center text input, two-way synced

import { useCallback, useEffect, useRef, useState } from 'react';

const R = 150;       // radius of dial track (increased from 90)
const SIZE = 380;    // overall SVG size (increased from 240)
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAGNETIC_THRESHOLD = 90; // px from center to trigger magnetic effect

// Convert angle (0=top, clockwise) to HH:MM
function angleToTime(angleDeg) {
  const minutes = Math.round(((angleDeg + 360) % 360) / 360 * 1440);
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

// Convert HH:MM to angle (0=top, clockwise)
function timeToAngle(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = h * 60 + m;
  return (totalMins / 1440) * 360;
}

// Validate and normalize a partial time string
function parseTimeInput(raw) {
  const cleaned = raw.replace(/[^0-9:]/g, '');
  const parts = cleaned.split(':');
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export default function CircularDial({ value, onChange }) {
  const svgRef     = useRef(null);
  const wrapRef    = useRef(null);
  const drag       = useRef(false);
  const [inputVal, setInputVal] = useState(value);
  const [magnetic, setMagnetic] = useState(false);
  const angleDeg   = timeToAngle(value);

  // Sync inputVal when parent value changes (from dial drag)
  useEffect(() => {
    setInputVal(value);
  }, [value]);

  // ── Drag handling (outer ring) ────────────────────────────────────────────
  const getAngleFromEvent = useCallback((e) => {
    const svg  = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
    const dy   = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
    let angle  = (Math.atan2(dy, dx) * 180 / Math.PI) + 90; // 0=top
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const handleMove = useCallback((e) => {
    if (!drag.current) return;
    e.preventDefault();
    const angle = getAngleFromEvent(e);
    onChange(angleToTime(angle));
  }, [getAngleFromEvent, onChange]);

  useEffect(() => {
    const stop = () => { drag.current = false; };
    window.addEventListener('mouseup',   stop);
    window.addEventListener('touchend',  stop);
    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    return () => {
      window.removeEventListener('mouseup',   stop);
      window.removeEventListener('touchend',  stop);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [handleMove]);

  // ── Center text input → dial (two-way sync) ──────────────────────────────
  const handleInputChange = (e) => {
    const raw = e.target.value;
    setInputVal(raw);
    const parsed = parseTimeInput(raw);
    if (parsed) {
      onChange(parsed);
    }
  };

  const handleInputBlur = () => {
    // On blur, snap to the current valid value
    setInputVal(value);
  };

  // ── Magnetic hover detection ──────────────────────────────────────────────
  const handleWrapMouseMove = useCallback((e) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    setMagnetic(dist < MAGNETIC_THRESHOLD);
  }, []);

  const handleWrapMouseLeave = useCallback(() => {
    setMagnetic(false);
  }, []);

  // ── SVG geometry ──────────────────────────────────────────────────────────
  const knobRad  = (angleDeg - 90) * Math.PI / 180;
  const knobX    = CX + R * Math.cos(knobRad);
  const knobY    = CY + R * Math.sin(knobRad);

  // Arc path from top to knob
  const arcRad   = (angleDeg / 360) * 2 * Math.PI;
  const arcX     = CX + R * Math.cos(-Math.PI / 2 + arcRad);
  const arcY     = CY + R * Math.sin(-Math.PI / 2 + arcRad);
  const largeArc = angleDeg > 180 ? 1 : 0;

  return (
    <div
      ref={wrapRef}
      className="dial-container"
      style={{ width: SIZE, height: SIZE, position: 'relative' }}
      onMouseMove={handleWrapMouseMove}
      onMouseLeave={handleWrapMouseLeave}
    >
      {/* SVG dial ring */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE} height={SIZE}
        style={{ display: 'block' }}
        onMouseDown={() => { drag.current = true; }}
        onTouchStart={() => { drag.current = true; }}
      >
        <defs>
          <filter id="dialGlow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#C4D4F2" stopOpacity="0.5"/>
          </linearGradient>
        </defs>

        {/* Outer track */}
        <circle cx={CX} cy={CY} r={R}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>

        {/* Inner subtle ring */}
        <circle cx={CX} cy={CY} r={R - 18}
          fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>

        {/* Active arc */}
        {angleDeg > 0.5 && (
          <path
            d={`M ${CX} ${CY - R} A ${R} ${R} 0 ${largeArc} 1 ${arcX} ${arcY}`}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#dialGlow)"
          />
        )}

        {/* 24 hour tick marks */}
        {Array.from({length: 24}, (_, i) => {
          const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const isMajor = i % 6 === 0; // 0, 6, 12, 18
          const len = isMajor ? 10 : 5;
          const x1 = CX + (R - len) * Math.cos(a);
          const y1 = CY + (R - len) * Math.sin(a);
          const x2 = CX + (R + 4) * Math.cos(a);
          const y2 = CY + (R + 4) * Math.sin(a);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'}
              strokeWidth={isMajor ? 1.5 : 0.8}
            />
          );
        })}

        {/* Quadrant labels: 00, 06, 12, 18 */}
        {[
          { label: '00', angle: -Math.PI / 2 },
          { label: '06', angle: 0 },
          { label: '12', angle: Math.PI / 2 },
          { label: '18', angle: Math.PI },
        ].map(({ label, angle }) => (
          <text
            key={label}
            x={CX + (R + 20) * Math.cos(angle)}
            y={CY + (R + 20) * Math.sin(angle)}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.18)"
            fontSize="10"
            fontWeight="500"
            fontFamily="Inter, sans-serif"
            letterSpacing="0.08em"
          >
            {label}
          </text>
        ))}

        {/* Draggable knob */}
        <circle cx={knobX} cy={knobY} r={14}
          fill="#fff"
          filter="url(#dialGlow)"
          style={{ cursor: 'none' }}
        />
        <circle cx={knobX} cy={knobY} r={5.5} fill="#0B0B0B"/>

        {/* "ALARM" label under center */}
        <text x={CX} y={CY + 50} textAnchor="middle"
          fill="rgba(255,255,255,0.2)"
          fontSize="9" fontWeight="600"
          fontFamily="Inter, sans-serif"
          letterSpacing="0.2em">
          ALARM
        </text>
      </svg>

      {/* ── Center HTML text input (overlaid) ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -55%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'auto',
      }}>
        <input
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="HH:MM"
          maxLength={5}
          className={`dial-center-input${magnetic ? ' magnetic-active' : ''}`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
