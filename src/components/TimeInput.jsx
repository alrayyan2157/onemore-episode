// src/components/TimeInput.jsx
// Glassmorphic typeable alarm time input

export default function TimeInput({ value, onChange }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      padding: '1.5rem 1.75rem',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    }}
      className="time-input-glass"
    >
      <div className="label-micro" style={{ marginBottom: 12, color: 'rgba(255,255,255,0.3)' }}>
        ALARM RING TIME
      </div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontFamily: 'var(--font)',
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 800,
          outline: 'none',
          colorScheme: 'dark',
          letterSpacing: '-0.03em',
          width: '100%',
          cursor: 'none',
          padding: 0,
        }}
      />
      <div style={{
        marginTop: 10,
        fontSize: 10,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.08em',
      }}>
        Click to type · 24-hour format
      </div>
    </div>
  );
}
