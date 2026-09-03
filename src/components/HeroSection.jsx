// src/components/HeroSection.jsx
// Cinematic full-screen hero with massive "ONE MORE EPISODE" title and neon glow

export default function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      overflow: 'hidden',
    }}>
      {/* Top label */}
      <div style={{
        position: 'absolute', top: '2.5rem',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#39FF85',
          boxShadow: '0 0 10px #39FF85',
          display: 'inline-block',
          animation: 'blink-led 2s ease-in-out infinite',
        }} />
        <span className="label-micro" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ONE MORE™ · SLEEP REGRET PREDICTION ENGINE
        </span>
      </div>

      {/* Main headline */}
      <div style={{ maxWidth: 1100 }}>
        <h1 className="hero-title">
          ONE MORE<br />EPISODE
        </h1>
      </div>

      {/* Sub text */}
      <p className="text-body" style={{
        marginTop: '2.5rem',
        maxWidth: 520,
        fontSize: '1.1rem',
        lineHeight: 1.65,
      }}>
        A hyper-precise, mathematically rigorous tool for calculating
        the exact cost of watching <em>just one more episode.</em>
      </p>

      {/* Scroll CTA */}
      <a href="#calculator" style={{
        marginTop: '3.5rem',
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontWeight: 600, fontSize: 13,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)',
        textDecoration: 'none',
        transition: 'color 0.2s',
      }}>
        Begin Analysis
      </a>

      {/* Animated scroll line */}
      <div className="scroll-line" />

      {/* Bottom corner metadata */}
      <div style={{
        position: 'absolute', bottom: '2.5rem', left: '2.5rem',
        display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left',
      }}>
        <span className="label-micro">Version 4.0</span>
        <span className="label-micro" style={{ color: 'rgba(255,255,255,0.18)' }}>Global Regret Index: Active</span>
      </div>
      <div style={{
        position: 'absolute', bottom: '2.5rem', right: '2.5rem',
        textAlign: 'right',
      }}>
        <span className="label-micro" style={{ color: 'rgba(255,255,255,0.18)' }}>No sleep was harmed in<br/>making this application.</span>
      </div>

      <style>{`@keyframes blink-led{0%,90%,100%{opacity:1}95%{opacity:0.1}}`}</style>
    </section>
  );
}
