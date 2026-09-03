// src/hooks/useAudio.js
// Web Audio API synth — no MP3s, pure code

let _ctx = null;
function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

export function playClick() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(900, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.06);
}

export function playWarpChime() {
  const ctx = getCtx();
  const freqs = [220, 330, 440, 660];
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.07 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.07);
    osc.stop(ctx.currentTime + i * 0.07 + 0.45);
  });

  // Low drone buzz
  const buzz = ctx.createOscillator();
  const buzzGain = ctx.createGain();
  buzz.type = 'sawtooth';
  buzz.frequency.setValueAtTime(55, ctx.currentTime);
  buzz.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
  buzzGain.gain.setValueAtTime(0.07, ctx.currentTime);
  buzzGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  buzz.connect(buzzGain); buzzGain.connect(ctx.destination);
  buzz.start(); buzz.stop(ctx.currentTime + 1.2);
}

export function playAlertHum() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, ctx.currentTime);
  osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
  osc.frequency.setValueAtTime(160, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.8);
}
