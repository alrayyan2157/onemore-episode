// src/components/RadialGauge.jsx
// SVG circular progress gauge that shifts color with regret level

export default function RadialGauge({ value, accentColor }) {
  const R = 90;
  const cx = 110, cy = 110;
  const circumference = 2 * Math.PI * R;
  // Arc spans 270 degrees (from 135° to 405°)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (Math.min(value, 99.999) / 100) * arcLength;

  // Glow color
  const glow = accentColor;

  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      <defs>
        <filter id="gauge-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5D4" />
          <stop offset="50%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#FF2A54" />
        </linearGradient>
      </defs>

      {/* Track */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="12"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
      />

      {/* Active arc */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={glow}
        strokeWidth="12"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
        filter="url(#gauge-glow)"
        style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
      />

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const angleDeg = 135 + (pct / 100) * 270;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x1 = cx + (R - 20) * Math.cos(angleRad);
        const y1 = cy + (R - 20) * Math.sin(angleRad);
        const x2 = cx + (R - 10) * Math.cos(angleRad);
        const y2 = cy + (R - 10) * Math.sin(angleRad);
        return (
          <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        );
      })}
    </svg>
  );
}
