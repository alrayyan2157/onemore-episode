// src/components/RegretGraph.jsx — Premium dark Bezier graph

import { useMemo, useState } from 'react';

const W = 480, H = 180;
const PAD = { t: 20, r: 16, b: 28, l: 32 };
const GW = W - PAD.l - PAD.r;
const GH = H - PAD.t - PAD.b;
const MAX_EP = 10;

const toX = (ep)  => PAD.l + ((ep - 1) / (MAX_EP - 1)) * GW;
const toY = (pct) => PAD.t + GH - (Math.max(0, Math.min(100, pct)) / 100) * GH;

const dopAt = (ep)  => Math.max(5, 95 - 77 * (Math.log(ep) / Math.log(MAX_EP)));
const regAt = (ep, fr, totalEp) => Math.min(99.5, fr * Math.pow(ep / Math.max(totalEp, 1), 0.65));

function smoothBezier(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px,py] = pts[i-1], [cx2,cy2] = pts[i];
    const cpX = (px+cx2)/2;
    d += ` C ${cpX.toFixed(1)} ${py.toFixed(1)}, ${cpX.toFixed(1)} ${cy2.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}`;
  }
  return d;
}

function findCrossover(fr, totalEp) {
  for (let ep = 1; ep <= MAX_EP; ep += 0.1) {
    if (regAt(ep, fr, totalEp) >= dopAt(ep)) return (ep-1)/(MAX_EP-1);
  }
  return null;
}

export default function RegretGraph({ episodes, finalRegret }) {
  const [hoverX, setHoverX] = useState(null);

  const { dopPath, regPath, crossover, areaDop, areaReg } = useMemo(() => {
    const dPts = [], rPts = [];
    for (let ep = 1; ep <= MAX_EP; ep++) {
      dPts.push([toX(ep), toY(dopAt(ep))]);
      rPts.push([toX(ep), toY(regAt(ep, finalRegret, episodes))]);
    }
    const dp = smoothBezier(dPts), rp = smoothBezier(rPts);
    const floor = ` L ${PAD.l+GW} ${PAD.t+GH} L ${PAD.l} ${PAD.t+GH} Z`;
    const frac = findCrossover(finalRegret, episodes);
    const co = frac !== null ? { x: PAD.l+frac*GW, y: toY(dopAt(1+frac*(MAX_EP-1))) } : null;
    return { dopPath: dp, regPath: rp, crossover: co, areaDop: dp+floor, areaReg: rp+floor };
  }, [episodes, finalRegret]);

  const scrub = useMemo(() => {
    if (hoverX === null) return null;
    const frac = (hoverX - PAD.l) / GW;
    if (frac < 0 || frac > 1) return null;
    const ep = 1 + frac * (MAX_EP - 1);
    return {
      x: hoverX,
      ep: ep.toFixed(1),
      d: dopAt(ep).toFixed(0),
      r: regAt(ep, finalRegret, episodes).toFixed(0),
      sleep: Math.max(0, 8 - (regAt(ep,finalRegret,episodes)/100)*6).toFixed(1),
    };
  }, [hoverX, episodes, finalRegret]);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span className="label-micro">Crossover Point™ · Dopamine vs Regret</span>
        <div style={{ display:'flex', gap:14 }}>
          {[['#00F5D4','Dopamine'],['#FF2A54','Regret']].map(([c,l])=>(
            <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:12, height:2, background:c, borderRadius:1, display:'inline-block' }}/>
              <span style={{ fontSize:9, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:c, opacity:.75 }}>{l}</span>
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
        style={{ cursor:'crosshair', overflow:'visible' }}
        onMouseMove={e=>{
          const r=e.currentTarget.getBoundingClientRect();
          setHoverX(((e.clientX-r.left)/r.width)*W);
        }}
        onMouseLeave={()=>setHoverX(null)}
      >
        <defs>
          <linearGradient id="gDop" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity=".18"/>
            <stop offset="100%" stopColor="#00F5D4" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="gReg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF2A54" stopOpacity=".2"/>
            <stop offset="100%" stopColor="#FF2A54" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {[0,25,50,75,100].map(p=>(
          <g key={p}>
            <line x1={PAD.l} y1={toY(p)} x2={W-PAD.r} y2={toY(p)} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            <text x={PAD.l-4} y={toY(p)+4} textAnchor="end" fill="rgba(255,255,255,0.18)" fontSize="8" fontFamily="Inter,sans-serif">{p}</text>
          </g>
        ))}
        {[1,3,5,7,10].map(ep=>(
          <text key={ep} x={toX(ep)} y={H-5} textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize="8" fontFamily="Inter,sans-serif">{ep}</text>
        ))}

        <path d={areaDop} fill="url(#gDop)" style={{transition:'d .5s ease'}}/>
        <path d={areaReg} fill="url(#gReg)" style={{transition:'d .5s ease'}}/>
        <path d={dopPath}  fill="none" stroke="#00F5D4" strokeWidth="2" strokeLinecap="round" style={{transition:'d .5s ease'}}/>
        <path d={regPath}  fill="none" stroke="#FF2A54" strokeWidth="2" strokeLinecap="round" style={{transition:'d .5s ease'}}/>

        {crossover && (
          <g>
            <line x1={crossover.x} y1={PAD.t} x2={crossover.x} y2={PAD.t+GH} stroke="rgba(245,166,35,0.25)" strokeDasharray="4 3" strokeWidth="1"/>
            <circle cx={crossover.x} cy={crossover.y} r="5" fill="#F5A623"/>
            <circle cx={crossover.x} cy={crossover.y} r="5" fill="none" stroke="#F5A623" strokeWidth="1.5"
              style={{animation:'cPulse 1.4s ease-out infinite', transformOrigin:`${crossover.x}px ${crossover.y}px`}}/>
            <text x={crossover.x+8} y={crossover.y-8} fill="#F5A623" fontSize="7.5" fontFamily="Inter,sans-serif" fontWeight="700">POINT OF NO RETURN</text>
            <style>{`@keyframes cPulse{0%{transform:scale(1);opacity:1}100%{transform:scale(2.8);opacity:0}}`}</style>
          </g>
        )}

        {scrub && (
          <g>
            <line x1={scrub.x} y1={PAD.t} x2={scrub.x} y2={PAD.t+GH} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" strokeWidth="1"/>
            <rect x={Math.min(scrub.x+5,W-92)} y={PAD.t} width={86} height={44} rx="6"
              fill="rgba(17,17,17,0.95)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            <text x={Math.min(scrub.x+9,W-88)} y={PAD.t+13} fill="rgba(255,255,255,.65)" fontSize="8" fontFamily="Inter,sans-serif">Ep {scrub.ep}</text>
            <text x={Math.min(scrub.x+9,W-88)} y={PAD.t+25} fill="#00F5D4" fontSize="8" fontFamily="Inter,sans-serif">Dop {scrub.d}%</text>
            <text x={Math.min(scrub.x+9,W-88)} y={PAD.t+37} fill="#FF2A54" fontSize="8" fontFamily="Inter,sans-serif">Reg {scrub.r}% · {scrub.sleep}h</text>
          </g>
        )}
      </svg>
    </div>
  );
}
