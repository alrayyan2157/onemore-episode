// src/components/CircularDial.jsx
// Drag-to-set circular wake-up time dial

import { useCallback, useEffect, useRef, useState } from 'react';

const R = 90; // radius of dial track
const SIZE = 240;
const CX = SIZE / 2, CY = SIZE / 2;

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

export default function CircularDial({ value, onChange }) {
  const svgRef  = useRef(null);
  const drag    = useRef(false);
  const angleDeg = timeToAngle(value);

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

  // Knob position
  const knobRad  = (angleDeg - 90) * Math.PI / 180;
  const knobX    = CX + R * Math.cos(knobRad);
  const knobY    = CY + R * Math.sin(knobRad);

  // Arc path from top to knob
  const arcRad   = (angleDeg / 360) * 2 * Math.PI;
  const arcX     = CX + R * Math.cos(-Math.PI / 2 + arcRad);
  const arcY     = CY + R * Math.sin(-Math.PI / 2 + arcRad);
  const largeArc = angleDeg > 180 ? 1 : 0;

  return (
    <div className="dial-container" style={{ width: SIZE, height: SIZE }}>
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
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx={CX} cy={CY} r={R}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3"/>

        {/* Active arc */}
        {angleDeg > 0.5 && (
          <path
            d={`M ${CX} ${CY - R} A ${R} ${R} 0 ${largeArc} 1 ${arcX} ${arcY}`}
            fill="none"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#dialGlow)"
          />
        )}

        {/* Hour tick marks */}
        {Array.from({length:12},(_,i)=>{
          const a = (i/12)*Math.PI*2 - Math.PI/2;
          const x1= CX+(R-5)*Math.cos(a), y1=CY+(R-5)*Math.sin(a);
          const x2= CX+(R+5)*Math.cos(a), y2=CY+(R+5)*Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>;
        })}

        {/* Knob */}
        <circle cx={knobX} cy={knobY} r={12}
          fill="#fff"
          filter="url(#dialGlow)"
          style={{ cursor: 'none' }}
        />
        <circle cx={knobX} cy={knobY} r={5} fill="#000"/>

        {/* Centre time */}
        <text x={CX} y={CY-8} textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize="22" fontWeight="800"
          fontFamily="Inter, sans-serif"
          letterSpacing="-0.04em">
          {value}
        </text>
        <text x={CX} y={CY+16} textAnchor="middle"
          fill="rgba(255,255,255,0.28)"
          fontSize="10" fontWeight="600"
          fontFamily="Inter, sans-serif"
          letterSpacing="0.15em">
          ALARM
        </text>
      </svg>
    </div>
  );
}
