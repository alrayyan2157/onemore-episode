// src/components/PredictionModal.jsx
// Spring-bounce modal — "Tomorrow You" prediction, shown on CTA click

const MESSAGES = {
  0: {
    headline: 'Tomorrow You is cautiously optimistic.',
    body: 'You\'ll survive. Coffee: optional. Productivity: marginally impaired. You\'ve made this choice before and you turned out fine. Probably.',
    icon: '🌙',
    color: '#00F5D4',
  },
  1: {
    headline: 'Tomorrow You has already cancelled the gym.',
    body: 'An extra espresso has been pre-ordered. The morning meeting will feature your finest impression of a functioning human being. The raccoon eyes are non-negotiable.',
    icon: '😑',
    color: '#F5A623',
  },
  2: {
    headline: 'Tomorrow You is staring at a shower wall.',
    body: 'It is 7:04 AM. The water has gone cold. You\'re wondering who gave you unsupervised access to a streaming service. The answer is nobody. You did this yourself.',
    icon: '🚿',
    color: '#FF6B35',
  },
  3: {
    headline: 'Transmission Lost.',
    body: 'Tomorrow You has entered a state of full cognitive bankruptcy. No espresso can reverse this. Emergency contact has been notified. You are on your own.',
    icon: '☠️',
    color: '#FF2A54',
  },
};

export default function PredictionModal({ txTier, finalRegret, sleepHours, sleepNeg, onClose }) {
  const m = MESSAGES[txTier] || MESSAGES[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%', width: 32, height: 32,
          color: 'rgba(255,255,255,0.5)',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'none', transition: 'background 0.2s',
        }}>×</button>

        {/* Icon */}
        <div style={{ fontSize: 52, marginBottom: '1rem', lineHeight: 1 }}>{m.icon}</div>

        {/* Label */}
        <div className="label-micro" style={{ color: m.color, marginBottom: '0.75rem' }}>
          Tomorrow You · Encrypted Com-Link
        </div>

        {/* Headline */}
        <h2 style={{
          fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: '#fff',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
        }}>{m.headline}</h2>

        {/* Body */}
        <p style={{
          fontSize: '0.95rem',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.62)',
          marginBottom: '2rem',
        }}>{m.body}</p>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Regret Score',    value: `${finalRegret.toFixed(3)}%`, color: m.color },
            { label: 'Projected Sleep', value: sleepNeg ? `−${Math.abs(sleepHours).toFixed(1)}h` : `${sleepHours.toFixed(1)}h`, color: sleepNeg ? '#FF2A54' : m.color },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '1rem',
            }}>
              <div className="label-micro" style={{ marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.035em', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="label-micro" style={{ marginBottom: 8 }}>Regret Spectrum</div>
        <div className="progress-track">
          <div className="progress-fill" style={{
            width: `${finalRegret}%`,
            background: `linear-gradient(to right, #00F5D4, #F5A623, #FF2A54)`,
          }}/>
        </div>

        <button
          onClick={onClose}
          className="pill-btn"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            marginTop: '2rem',
            height: 50,
          }}
        >
          Acknowledge & Continue Making Terrible Decisions
        </button>
      </div>
    </div>
  );
}
