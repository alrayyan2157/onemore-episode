// src/components/PredictionModal.jsx
// Spring-bounce modal — 12-tier "Tomorrow You" regret messages

function getRegretMessage(pct) {
  if (pct >= 100)  return { msg: 'Congratulations. You watched one more. And then another. Sleep has left the chat.', icon: '💀', color: '#FF2A54' };
  if (pct >= 95)   return { msg: 'Your future self would like to speak to you.',                                      icon: '☠️', color: '#FF2A54' };
  if (pct >= 90)   return { msg: 'Tomorrow morning is officially your problem.',                                      icon: '🔥', color: '#FF2A54' };
  if (pct >= 80)   return { msg: 'Congratulations. You have traded sleep for Netflix.',                               icon: '📺', color: '#FF6B35' };
  if (pct >= 70)   return { msg: 'Your brain will load tomorrow like slow Wi-Fi.',                                    icon: '🐌', color: '#FF6B35' };
  if (pct >= 60)   return { msg: 'Your alarm is about to become your biggest enemy.',                                icon: '⏰', color: '#F5A623' };
  if (pct >= 50)   return { msg: 'Tomorrow you is already questioning your decisions.',                               icon: '🤔', color: '#F5A623' };
  if (pct >= 40)   return { msg: 'Morning you is going to be slightly disappointed.',                                icon: '😑', color: '#F5A623' };
  if (pct >= 30)   return { msg: "You'll need coffee. Maybe two.",                                                    icon: '☕', color: 'rgba(255,255,255,0.7)' };
  if (pct >= 20)   return { msg: "Tomorrow's alarm might hurt a little.",                                             icon: '😴', color: 'rgba(255,255,255,0.7)' };
  if (pct >= 10)   return { msg: 'Just a little sleepy. Nothing serious.',                                            icon: '🌙', color: '#00F5D4' };
  return                   { msg: "You'll be fine. Probably.",                                                         icon: '✨', color: '#00F5D4' };
}

export default function PredictionModal({ txTier, finalRegret, sleepHours, sleepNeg, onClose }) {
  const { msg, icon, color } = getRegretMessage(Math.round(finalRegret));

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
        <div style={{ fontSize: 52, marginBottom: '1rem', lineHeight: 1 }}>{icon}</div>

        {/* Label */}
        <div className="label-micro" style={{ color, marginBottom: '0.75rem' }}>
          Tomorrow You · Encrypted Com-Link
        </div>

        {/* Regret message */}
        <h2 style={{
          fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: '#fff',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
        }}>{msg}</h2>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Regret Score',    value: `${finalRegret.toFixed(3)}%`, c: color },
            { label: 'Projected Sleep', value: sleepNeg ? `−${Math.abs(sleepHours).toFixed(1)}h` : `${sleepHours.toFixed(1)}h`, c: sleepNeg ? '#FF2A54' : color },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '1rem',
            }}>
              <div className="label-micro" style={{ marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.035em', color: s.c }}>{s.value}</div>
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
