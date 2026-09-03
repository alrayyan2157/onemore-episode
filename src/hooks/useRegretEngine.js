// src/hooks/useRegretEngine.js
// Bulletproof temporal logic — handles 24-hr wrap, negative sleep, multi-day binges

import { useMemo } from 'react';

const STAKES_MAP = { 0: 0.82, 1: 1.0, 2: 1.45 };
const CLIFF_MAP  = { 0: 0,    1: 3.5, 2: 8.2  };

export function useRegretEngine({ episodes, runtime, wakeUpTime, stakes, cliffhanger, now }) {
  return useMemo(() => {
    // ── 1. Window to next alarm (handles overnight wrap) ──────────────────────
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const [alarmH, alarmM] = wakeUpTime.split(':').map(Number);
    let alarmTotalMinutes = alarmH * 60 + alarmM;

    // If alarm time is numerically ≤ now, it's tomorrow
    if (alarmTotalMinutes <= currentTotalMinutes) {
      alarmTotalMinutes += 24 * 60;
    }

    const windowMinutes = alarmTotalMinutes - currentTotalMinutes;
    const bingeMinutes  = episodes * runtime;
    const sleepMinutes  = windowMinutes - bingeMinutes - 15; // 15 min fall-asleep buffer

    // ── 2. Derived Metrics ────────────────────────────────────────────────────
    const sleepHours  = (Math.max(0, sleepMinutes) / 60);
    const sleepNeg    = sleepMinutes < 0;
    const daysOffset  = Math.floor(bingeMinutes / 1440);
    const finishTime  = new Date(now.getTime() + bingeMinutes * 60000);

    // ── 3. Regret Formula ─────────────────────────────────────────────────────
    let baseRegret;
    if (sleepMinutes <= 0) {
      baseRegret = 99.999;
    } else {
      const sleepDeficitRatio = bingeMinutes / (bingeMinutes + sleepMinutes);
      baseRegret = Math.min(98.5, Math.pow(sleepDeficitRatio, 1.25) * 100);
    }

    const microJitter = ((runtime * 13 + episodes * 7) % 100) / 750;
    const stakesMulti = STAKES_MAP[stakes]   ?? 1.0;
    const cliffBonus  = CLIFF_MAP[cliffhanger] ?? 0;

    const finalRegret = sleepMinutes <= 0
      ? 99.999
      : Math.min(99.999, Math.max(4.125, baseRegret * stakesMulti + cliffBonus + microJitter));

    // ── 4. Color & Status ──────────────────────────────────────────────────────
    let accentColor = '#00F5D4';
    let statusLabel = 'NOMINAL';
    if (finalRegret > 50) { accentColor = '#F5A623'; statusLabel = 'ELEVATED';  }
    if (finalRegret > 76) { accentColor = '#FF6B35'; statusLabel = 'CRITICAL';  }
    if (finalRegret > 90) { accentColor = '#FF2A54'; statusLabel = 'REDLINE';   }

    // ── 5. Tomorrow You transmission tier ────────────────────────────────────
    let txTier = 0;
    if (finalRegret >= 40) txTier = 1;
    if (finalRegret >= 75) txTier = 2;
    if (finalRegret >= 95) txTier = 3;

    return {
      finalRegret,
      sleepHours,
      sleepNeg,
      daysOffset,
      finishTime,
      bingeMinutes,
      accentColor,
      statusLabel,
      txTier,
    };
  }, [episodes, runtime, wakeUpTime, stakes, cliffhanger, now]);
}
