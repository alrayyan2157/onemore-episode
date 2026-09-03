// src/components/StarfieldCanvas.jsx
// Mouse-parallax deep space starfield — fixed behind all content

import { useEffect, useRef } from 'react';

const STAR_COUNT = 300;
const LAYERS = [
  { count: 120, sizeMin: 0.3, sizeMax: 0.8, speed: 0.012, color: 'rgba(180,200,255,' },
  { count: 100, sizeMin: 0.8, sizeMax: 1.5, speed: 0.025, color: 'rgba(220,230,255,' },
  { count: 80,  sizeMin: 1.2, sizeMax: 2.2, speed: 0.045, color: 'rgba(255,255,255,' },
];

function createStars() {
  const stars = [];
  LAYERS.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin),
        layer: li,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.3 + Math.random() * 0.8,
      });
    }
  });
  return stars;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });   // normalized 0-1
  const smoothRef = useRef({ x: 0.5, y: 0.5 });
  const starsRef  = useRef(createStars());
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const draw = (t) => {
      rafRef.current = requestAnimationFrame(draw);
      const W = canvas.width, H = canvas.height;

      // Smooth mouse follow (lerp)
      const sm = smoothRef.current;
      const tm = mouseRef.current;
      sm.x += (tm.x - sm.x) * 0.04;
      sm.y += (tm.y - sm.y) * 0.04;

      // Parallax offsets per layer (opposite to mouse)
      const parallaxScale = [15, 30, 55]; // pixels of shift

      // Background gradient
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.5, H * 0.9);
      bg.addColorStop(0, '#0c0a1a');
      bg.addColorStop(0.5, '#060510');
      bg.addColorStop(1, '#020204');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle nebula smudges
      const neb = ctx.createRadialGradient(W * 0.3, H * 0.35, 0, W * 0.3, H * 0.35, H * 0.4);
      neb.addColorStop(0, 'rgba(40,10,80,0.12)');
      neb.addColorStop(1, 'transparent');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, W, H);

      const neb2 = ctx.createRadialGradient(W * 0.75, H * 0.7, 0, W * 0.75, H * 0.7, H * 0.35);
      neb2.addColorStop(0, 'rgba(80,10,30,0.08)');
      neb2.addColorStop(1, 'transparent');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, W, H);

      // Draw stars
      const sec = t / 1000;
      starsRef.current.forEach((star) => {
        const layer = LAYERS[star.layer];
        const pScale = parallaxScale[star.layer];

        // Position with parallax (shift opposite to mouse)
        const px = star.x * W + (0.5 - sm.x) * pScale;
        const py = star.y * H + (0.5 - sm.y) * pScale;

        // Twinkle
        const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(sec * star.twinkleSpeed + star.twinklePhase));

        ctx.beginPath();
        ctx.arc(px, py, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `${layer.color}${twinkle.toFixed(2)})`;
        ctx.fill();
      });
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
