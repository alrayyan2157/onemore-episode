// src/components/MiseryTimeline.jsx
// Horizontal "Misery Timeline" — binge vs sleep visualization

import { useMemo } from 'react';

const pad2 = (n) => String(n).padStart(2, '0');
const formatTime = (d) => {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${pad2(m)} ${ampm}`;
};

export default function MiseryTimeline({
  now,
  wakeUpTime,
  bingeMinutes,
  sleepHours,
  sleepNeg,
  finalRegret,
  finishTime,
}) {
  const data = useMemo(() => {
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [alarmH, alarmM] = wakeUpTime.split(':').map(Number);
    let alarmMins = alarmH * 60 + alarmM;
    if (alarmMins <= currentMins) alarmMins += 24 * 60;

    const totalWindow = alarmMins - currentMins;
    const fallAsleepBuffer = 15;
    const sleepMins = Math.max(0, totalWindow - bingeMinutes - fallAsleepBuffer);

    // Percentages of the total window
    const bingePct = Math.min((bingeMinutes / totalWindow) * 100, 100);
    const bufferPct = Math.min((fallAsleepBuffer / totalWindow) * 100, 100 - bingePct);
    const sleepPct = Math.max(0, 100 - bingePct - bufferPct);
    const overflowPct = bingeMinutes > totalWindow
      ? ((bingeMinutes - totalWindow) / totalWindow) * 100
      : 0;

    const sleepH = Math.floor(sleepMins / 60);
    const sleepM = sleepMins % 60;

    const cognitiveDecline = Math.min(100, Math.round(finalRegret * 0.95));

    return {
      bingePct,
      bufferPct,
      sleepPct,
      overflowPct,
      sleepH,
      sleepM,
      cognitiveDecline,
      totalWindow,
    };
  }, [now, wakeUpTime, bingeMinutes, sleepHours, sleepNeg, finalRegret]);

  const sleepColor = sleepNeg ? '#FF2A54' : data.sleepPct < 30 ? '#FF6B35' : '#00F5D4';
  const bingeColor = sleepNeg ? '#FF2A54' : finalRegret > 76 ? '#FF6B35' : '#F5A623';

  return (
    <div>
      {/* Stat callouts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: '2rem',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
        }}>
          <div className="label-micro" style={{ marginBottom: 8 }}>Total Sleep</div>
          <div style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: sleepColor,
            lineHeight: 1,
            transition: 'color 0.4s',
          }}>
            {sleepNeg ? (
              <span>−{Math.abs(sleepHours).toFixed(1)}<span style={{ fontSize: '0.5em', opacity: 0.5 }}>h</span></span>
            ) : (
              <span>{data.sleepH}<span style={{ fontSize: '0.5em', opacity: 0.5 }}>h </span>{data.sleepM}<span style={{ fontSize: '0.5em', opacity: 0.5 }}>m</span></span>
            )}
          </div>
          {sleepNeg && (
            <div style={{ fontSize: 10, color: '#FF2A54', fontWeight: 600, marginTop: 6, letterSpacing: '0.05em' }}>
              ⚠ SLEEP DEFICIT
            </div>
          )}
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
        }}>
          <div className="label-micro" style={{ marginBottom: 8 }}>Est. Cognitive Decline</div>
          <div style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: finalRegret > 76 ? '#FF6B35' : finalRegret > 50 ? '#F5A623' : 'rgba(255,255,255,0.7)',
            lineHeight: 1,
            transition: 'color 0.4s',
          }}>
            {data.cognitiveDecline}<span style={{ fontSize: '0.5em', opacity: 0.5 }}>%</span>
          </div>
        </div>
      </div>

      {/* Timeline labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div>
          <div className="label-micro" style={{ color: 'rgba(255,255,255,0.25)' }}>NOW</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
            {formatTime(now)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label-micro" style={{ color: 'rgba(255,255,255,0.25)' }}>ALARM</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
            {wakeUpTime}
          </div>
        </div>
      </div>

      {/* Timeline bar */}
      <div style={{
        position: 'relative',
        height: 48,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        display: 'flex',
      }}>
        {/* Binge block */}
        <div style={{
          width: `${Math.min(data.bingePct, 100)}%`,
          height: '100%',
          background: `linear-gradient(135deg, ${bingeColor}, ${sleepNeg ? '#FF2A54' : '#FF6B35'})`,
          borderRadius: data.bingePct >= 100 ? '13px' : '13px 0 0 13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1), background 0.4s',
          position: 'relative',
          overflow: 'hidden',
          minWidth: data.bingePct > 3 ? 'auto' : 0,
          boxShadow: sleepNeg ? '0 0 20px rgba(255,42,84,0.4)' : 'none',
        }}>
          {data.bingePct > 15 && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(0,0,0,0.7)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              BINGE · {bingeMinutes}m
            </span>
          )}
          {/* Animated shimmer */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            animation: 'shimmer 2s ease-in-out infinite',
          }} />
        </div>

        {/* Fall-asleep buffer */}
        {!sleepNeg && data.bufferPct > 1 && (
          <div style={{
            width: `${data.bufferPct}%`,
            height: '100%',
            background: 'rgba(255,255,255,0.06)',
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        )}

        {/* Sleep block */}
        {!sleepNeg && data.sleepPct > 0 && (
          <div style={{
            width: `${data.sleepPct}%`,
            height: '100%',
            background: 'linear-gradient(135deg, #1a3a5c, #0d2847)',
            borderRadius: '0 13px 13px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            minWidth: data.sleepPct > 5 ? 'auto' : 0,
          }}>
            {data.sleepPct > 18 && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(100,180,255,0.7)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                SLEEP · {data.sleepH}h{data.sleepM > 0 ? ` ${data.sleepM}m` : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 20,
        marginTop: 14,
        justifyContent: 'center',
      }}>
        {[
          { color: bingeColor, label: 'Binge Time' },
          { color: 'rgba(255,255,255,0.08)', label: 'Fall Asleep' },
          { color: '#1a3a5c', label: 'Sleep' },
        ].map(item => (
          <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 10, height: 10, borderRadius: 3,
              background: item.color, display: 'inline-block',
            }} />
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
              {item.label}
            </span>
          </span>
        ))}
      </div>

      {/* Finish time note */}
      <div style={{
        textAlign: 'center',
        marginTop: 16,
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
        fontWeight: 500,
      }}>
        Binge ends at <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{formatTime(finishTime)}</span>
        {sleepNeg && <span style={{ color: '#FF2A54', fontWeight: 700 }}> · Past your alarm</span>}
      </div>

      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}
