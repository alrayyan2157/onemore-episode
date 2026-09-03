// src/App.jsx — ONE MORE™ v4 — Apple × Awwwards Premium Experience

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import CustomCursor       from './components/CustomCursor';
import StarfieldCanvas    from './components/StarfieldCanvas';
import HeroSection        from './components/HeroSection';
import CircularDial       from './components/CircularDial';
import ScoreOdometer      from './components/ScoreOdometer';
import MiseryTimeline     from './components/MiseryTimeline';
import PredictionModal    from './components/PredictionModal';
import { useRegretEngine } from './hooks/useRegretEngine';
import { playClick, playWarpChime, playAlertHum } from './hooks/useAudio';

// ─── helpers ────────────────────────────────────────────────────────────────
const pad2 = (n) => String(n).padStart(2,'0');
const nowHHMM = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const STAKES = [
  { label:'Casual',   sub:'Weekend / Freelancer',   icon:'🌙', v:0 },
  { label:'Normal',   sub:'Standard Workday',        icon:'💼', v:1 },
  { label:'Critical', sub:'Exam · Pitch · 8AM CEO',  icon:'☢️', v:2 },
];

const CLIFFHANGER = [
  { label:'None',   v:0 },
  { label:'Mild',   v:1 },
  { label:'Finale', sub:'Abrupt Cut to Black', v:2 },
];

// ─── Intersection Observer hook for scroll reveals ────────────────────────
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('visible');
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Magnetic button hook ─────────────────────────────────────────────────
function useMagnetic(strength = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * strength;
      const dy   = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);
  return ref;
}

// ─── Bento Card with 3D tilt + glow border ────────────────────────────────
function BentoCard({ children, style, className = '', delay = 0 }) {
  const ref     = useReveal();
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const el   = cardRef.current;
    const rect = el.getBoundingClientRect();
    const mx   = ((e.clientX - rect.left) / rect.width)  * 100;
    const my   = ((e.clientY - rect.top)  / rect.height) * 100;
    const rotX = ((e.clientY - rect.top  - rect.height/2) / rect.height) * -8;
    const rotY = ((e.clientX - rect.left - rect.width /2) / rect.width ) *  8;
    el.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
    el.style.setProperty('--mx', `${mx}%`);
    el.style.setProperty('--my', `${my}%`);
  };

  const handleLeave = () => {
    cardRef.current.style.transform = '';
  };

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      <div
        ref={cardRef}
        className="bento-card"
        style={{ height: '100%' }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [episodes,    setEpisodes]    = useState(2);
  const [runtime,     setRuntime]     = useState(45);
  const [wakeUpTime,  setWakeUpTime]  = useState('07:30');
  const [stakes,      setStakes]      = useState(1);
  const [cliffhanger, setCliffhanger] = useState(0);
  const [now,         setNow]         = useState(new Date());
  const [showModal,   setShowModal]   = useState(false);
  const [ripple,      setRipple]      = useState(false);
  const [glitching,   setGlitching]   = useState(false);
  const ctaRef = useMagnetic(0.28);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { finalRegret, sleepHours, sleepNeg, daysOffset, finishTime, bingeMinutes, accentColor, statusLabel, txTier }
    = useRegretEngine({ episodes, runtime, wakeUpTime, stakes, cliffhanger, now });

  // Alert hum at 85%
  const prevRegRef = useRef(finalRegret);
  useEffect(() => {
    if (prevRegRef.current <= 85 && finalRegret > 85) playAlertHum();
    prevRegRef.current = finalRegret;
  }, [finalRegret]);

  const handleCTA = useCallback(() => {
    // Glitch text
    setGlitching(true);
    setTimeout(() => setGlitching(false), 400);
    // Ripple
    setRipple(true);
    setTimeout(() => setRipple(false), 1000);
    // Audio
    playWarpChime();
    // Increment
    setEpisodes(e => e + 1);
    // Open modal after short delay
    setTimeout(() => setShowModal(true), 500);
  }, []);

  const runtimePct = ((runtime - 10) / 170) * 100;
  const finishStr  = finishTime.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true });
  const sleepLabel = sleepNeg ? `−${Math.abs(sleepHours).toFixed(1)}h` : `${sleepHours.toFixed(1)}h`;
  const sleepColor = sleepNeg ? '#FF2A54' : sleepHours < 5 ? '#FF6B35' : sleepHours < 7 ? '#F5A623' : '#00F5D4';

  return (
    <>
      <CustomCursor />
      {/* Ripple */}
      {ripple && <div className="ripple" />}
      {/* Modal */}
      {showModal && (
        <PredictionModal
          txTier={txTier}
          finalRegret={finalRegret}
          sleepHours={sleepHours}
          sleepNeg={sleepNeg}
          onClose={() => setShowModal(false)}
        />
      )}

      <div style={{ position:'relative', minHeight:'100vh', background:'#000' }}>
        {/* Starfield background */}
        <StarfieldCanvas />

        {/* ── HERO ── */}
        <div style={{ position:'relative', zIndex:1 }}>
          <HeroSection />
        </div>

        {/* ── CALCULATOR ── */}
        <section id="calculator" style={{
          position:'relative', zIndex:1,
          maxWidth:1320, margin:'0 auto',
          padding:'6rem 2rem 8rem',
        }}>

          {/* Section heading */}
          <div style={{ marginBottom:'4rem' }}>
            <div className="label-micro" style={{ marginBottom:'1rem' }}>Sleep Regret Engine · v4.0</div>
            <h2 className="text-headline" style={{ maxWidth:520 }}>
              Configure your trajectory.<br/>
              <span style={{ color:'rgba(255,255,255,0.4)' }}>The math doesn't care.</span>
            </h2>
          </div>

          {/* ─── BENTO GRID ─────────────────────────────────────────────── */}
          <div className="bento-grid">

            {/* Score hero card (spans 5 cols) */}
            <BentoCard
              delay={0}
              className=""
              style={{ gridColumn:'span 5' }}
            >
              <div className="label-micro" style={{ marginBottom:'1rem' }}>Regret Score Matrix</div>
              <ScoreOdometer value={finalRegret} accentColor={accentColor} />
              <div style={{
                fontFamily:'var(--font)', fontSize:11, fontWeight:600,
                letterSpacing:'0.18em', textTransform:'uppercase',
                color:'rgba(255,255,255,0.3)', marginTop:10,
              }}>
                {finalRegret >= 88 ? 'REDLINE: CRITICAL COGNITIVE BLOWOUT' : `STATUS: ${statusLabel}`}
              </div>

              {/* Progress bar */}
              <div className="progress-track" style={{ marginTop:'2rem' }}>
                <div className="progress-fill" style={{
                  width:`${finalRegret}%`,
                  background:`linear-gradient(to right, #00F5D4 0%, #F5A623 50%, #FF2A54 100%)`,
                }}/>
              </div>

              {/* Stat strip */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:'2rem' }}>
                {[
                  { l:'Binge',  v:`${bingeMinutes}m`, c:accentColor },
                  { l:'Finish', v:finishStr,           c:'#F5A623' },
                  { l:'Sleep',  v:sleepLabel,          c:sleepColor },
                ].map(s=>(
                  <div key={s.l}>
                    <div className="label-micro" style={{marginBottom:6}}>{s.l}</div>
                    <div className="stat-value" style={{ color:s.c, fontSize:'1.5rem' }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Wake-up time — glassmorphic oversized dial (7 cols) */}
            <BentoCard delay={80} style={{ gridColumn:'span 7' }}>
              <div className="label-micro" style={{ marginBottom:'1.25rem', textAlign:'center' }}>Alarm Ring Time</div>
              <div className="glassmorphic-alarm">
                <CircularDial
                  value={wakeUpTime}
                  onChange={(v) => { setWakeUpTime(v); playClick(); }}
                />
              </div>
              <div style={{
                marginTop: 12,
                fontSize: 10,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.08em',
                textAlign: 'center',
              }}>
                Drag ring or type center · 24-hour format
              </div>
            </BentoCard>

            {/* Episode count (4 cols) */}
            <BentoCard delay={100} style={{ gridColumn:'span 4' }}>
              <div className="label-micro" style={{ marginBottom:'1.25rem' }}>Episode Count</div>
              <div style={{
                display:'flex', alignItems:'center', gap:16, marginBottom:16,
              }}>
                <button
                  onClick={() => { setEpisodes(e=>Math.max(1,e-1)); playClick(); }}
                  style={{
                    width:44, height:44, borderRadius:'50%',
                    background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(255,255,255,0.1)',
                    color:'#fff', fontSize:20, display:'flex',
                    alignItems:'center', justifyContent:'center',
                    cursor:'none', transition:'background .15s',
                  }}
                >−</button>
                <div style={{
                  flex:1, textAlign:'center',
                  fontSize:'clamp(3rem,7vw,5rem)',
                  fontWeight:900, letterSpacing:'-0.05em',
                  color:accentColor, lineHeight:1,
                  transition:'color 0.4s',
                }}>
                  {episodes}
                </div>
                <button
                  onClick={() => { setEpisodes(e=>e+1); playClick(); }}
                  style={{
                    width:44, height:44, borderRadius:'50%',
                    background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(255,255,255,0.1)',
                    color:'#fff', fontSize:20, display:'flex',
                    alignItems:'center', justifyContent:'center',
                    cursor:'none', transition:'background .15s',
                  }}
                >+</button>
              </div>
              {/* Episode slider */}
              <input
                type="range" min={1} max={20} step={1} value={episodes}
                onChange={e => { setEpisodes(+e.target.value); }}
                className="premium-slider"
                style={{
                  background:`linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${((episodes-1)/19*100).toFixed(0)}%, rgba(255,255,255,0.1) ${((episodes-1)/19*100).toFixed(0)}%)`,
                }}
              />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>1</span>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>20</span>
              </div>
            </BentoCard>

            {/* Runtime slider (8 cols) */}
            <BentoCard delay={130} style={{ gridColumn:'span 8' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                <div className="label-micro">Episode Runtime</div>
                <div style={{ fontSize:'2.4rem', fontWeight:900, letterSpacing:'-0.04em', color:accentColor }}>
                  {runtime}<span style={{ fontSize:'1.2rem', opacity:0.45, marginLeft:3 }}>min</span>
                </div>
              </div>
              <input
                type="range" min={10} max={180} step={1} value={runtime}
                onChange={e => setRuntime(+e.target.value)}
                className="premium-slider"
                style={{
                  background:`linear-gradient(to right, #fff 0%, #fff ${runtimePct.toFixed(1)}%, rgba(255,255,255,0.1) ${runtimePct.toFixed(1)}%)`,
                  marginBottom:14,
                }}
              />
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[
                  { label: 'Anime', value: 24 },
                  { label: 'Sitcom', value: 30 },
                  { label: 'Drama', value: 45 },
                  { label: 'Prestige', value: 58 },
                  { label: 'Film', value: 90 },
                ].map(({ label, value }) => (
                    <button key={value}
                      onClick={() => { setRuntime(value); playClick(); }}
                      style={{
                        padding:'5px 12px', borderRadius:8,
                        background: runtime===value ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                        border:`1px solid ${runtime===value ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        color: runtime===value ? '#fff' : 'rgba(255,255,255,0.4)',
                        fontSize:11, fontWeight:600, cursor:'none', transition:'all .15s',
                      }}
                    >{label} · {value}m</button>
                ))}
              </div>
            </BentoCard>

            {/* Stakes (6 cols) */}
            <BentoCard delay={150} style={{ gridColumn:'span 6' }}>
              <div className="label-micro" style={{ marginBottom:'1.25rem' }}>Tomorrow Stakes</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {STAKES.map(o=>(
                  <button key={o.v}
                    onClick={() => { setStakes(o.v); playClick(); }}
                    style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'12px 14px', borderRadius:12,
                      background: stakes===o.v ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                      border:`1px solid ${stakes===o.v ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}`,
                      cursor:'none', transition:'all .2s', textAlign:'left',
                    }}
                  >
                    <span style={{ fontSize:20 }}>{o.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color: stakes===o.v ? '#fff' : 'rgba(255,255,255,0.55)' }}>{o.label}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', marginTop:1 }}>{o.sub}</div>
                    </div>
                    {stakes===o.v && (
                      <div style={{
                        marginLeft:'auto', width:7, height:7, borderRadius:'50%',
                        background:accentColor, boxShadow:`0 0 8px ${accentColor}`,
                      }}/>
                    )}
                  </button>
                ))}
              </div>
            </BentoCard>

            {/* Cliffhanger (6 cols) */}
            <BentoCard delay={180} style={{ gridColumn:'span 6' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                <div className="label-micro">Cliffhanger Intensity</div>
                {cliffhanger===2 && <AlertTriangle size={11} color="#FF2A54"/>}
              </div>
              <div className="seg-group">
                {CLIFFHANGER.map(o=>(
                  <button key={o.v}
                    className={`seg-option ${cliffhanger===o.v?'active':''}`}
                    onClick={() => { setCliffhanger(o.v); playClick(); if(o.v===2) playAlertHum(); }}
                  >
                    <div style={{ fontWeight:700 }}>{o.label}</div>
                    {o.sub && <div style={{ fontSize:9, opacity:.55, marginTop:1 }}>{o.sub}</div>}
                  </button>
                ))}
              </div>

              {cliffhanger===2 && (
                <div style={{
                  marginTop:14, padding:'10px 12px', borderRadius:10,
                  background:'rgba(255,42,84,0.08)', border:'1px solid rgba(255,42,84,0.25)',
                  fontSize:11, color:'#FF2A54', fontWeight:600, lineHeight:1.5,
                }}>
                  ⚠ Catastrophic narrative hook detected. Regret coefficient elevated by 8.2%.
                </div>
              )}

              {/* Current time readout */}
              <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="label-micro" style={{ marginBottom:8 }}>Current Time</div>
                <div style={{
                  fontFamily:'var(--font)', fontSize:'2.4rem',
                  fontWeight:900, letterSpacing:'-0.04em',
                  color:'rgba(255,255,255,0.85)',
                }}>
                  {nowHHMM(now)}
                  <span style={{ fontSize:'1rem', opacity:.3, marginLeft:6 }}>{pad2(now.getSeconds())}</span>
                </div>
              </div>
            </BentoCard>

            {/* Misery Timeline (12 cols) */}
            <BentoCard delay={200} style={{ gridColumn:'span 12' }}>
              <div className="label-micro" style={{ marginBottom:'1.5rem' }}>Misery Timeline · Sleep Debt Visualizer</div>
              <MiseryTimeline
                now={now}
                wakeUpTime={wakeUpTime}
                bingeMinutes={bingeMinutes}
                sleepHours={sleepHours}
                sleepNeg={sleepNeg}
                finalRegret={finalRegret}
                finishTime={finishTime}
              />
            </BentoCard>

            {/* Multi-day warning if needed */}
            {(sleepNeg || daysOffset > 0) && (
              <BentoCard delay={220} style={{ gridColumn:'span 12' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, color:'#FF2A54' }}>
                  <AlertTriangle size={16}/>
                  <span style={{ fontWeight:700, fontSize:14 }}>
                    {sleepNeg
                      ? `SLEEP DEBT DETECTED: ${Math.abs(sleepHours).toFixed(1)}h in deficit. You will not sleep before your alarm.`
                      : `DAY+${daysOffset} BOUNDARY CROSSED: Binge spans multiple calendar days.`}
                  </span>
                </div>
              </BentoCard>
            )}
          </div>

          {/* ─── CTA ─── */}
          <div style={{ display:'flex', justifyContent:'center', marginTop:'5rem' }}>
            <div ref={ctaRef} className="magnetic-wrap">
              <button
                onClick={handleCTA}
                className="pill-btn cta-pill"
                data-text="MAKE A TERRIBLE DECISION: WATCH ONE MORE"
                style={{
                  fontSize:'clamp(12px,1.5vw,15px)',
                  paddingLeft:'clamp(24px,4vw,52px)',
                  paddingRight:'clamp(24px,4vw,52px)',
                  height:64,
                  position:'relative',
                }}
              >
                <span
                  className={glitching ? 'glitching' : ''}
                  data-text="MAKE A TERRIBLE DECISION: WATCH ONE MORE"
                  style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:10 }}
                >
                  <Zap size={17} />
                  MAKE A TERRIBLE DECISION: WATCH ONE MORE
                </span>
              </button>
            </div>
          </div>

          {/* Legal */}
          <p style={{
            textAlign:'center', marginTop:'2rem',
            fontSize:11, color:'rgba(255,255,255,0.18)',
            lineHeight:1.6,
          }}>
            ONE MORE™ v4.0 · All data is satirical and mathematically rigorous.<br/>
            No actual sleep scientists were consulted in the making of this application.
          </p>
        </section>
      </div>
    </>
  );
}