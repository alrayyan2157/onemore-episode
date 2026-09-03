// src/components/AmbientBackground.jsx
// Slow-drifting mesh gradient orbs — deep purple + crimson

export default function AmbientBackground() {
  return (
    <>
      {/* Purple orb — top-right */}
      <div className="ambient-orb" style={{
        width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(88,28,255,0.5) 0%, rgba(123,97,255,0.15) 50%, transparent 70%)',
        top: '-15%', right: '-10%',
        animationDelay: '0s',
        animationDuration: '20s',
      }} />
      {/* Crimson orb — bottom-left */}
      <div className="ambient-orb" style={{
        width: 550, height: 550,
        background: 'radial-gradient(circle, rgba(180,20,60,0.45) 0%, rgba(255,42,84,0.1) 50%, transparent 70%)',
        bottom: '5%', left: '-8%',
        animationDelay: '-8s',
        animationDuration: '24s',
      }} />
      {/* Faint indigo center */}
      <div className="ambient-orb" style={{
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(40,10,80,0.4) 0%, transparent 70%)',
        top: '40%', left: '35%',
        animationDelay: '-14s',
        animationDuration: '28s',
        opacity: 0.35,
      }} />
    </>
  );
}
