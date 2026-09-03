// src/components/CustomCursor.jsx
// Physics-based custom cursor with text/button state detection

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ x: -100, y: -100 });
  const ring    = useRef({ x: -100, y: -100 });
  const rafRef  = useRef(null);
  const [ringClass, setRingClass] = useState('');

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };

      // Detect hovered element
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      const tag = el.tagName.toLowerCase();
      const isBtn = el.closest('button') || tag === 'button' || el.classList.contains('pill-btn');
      const isText = ['p','span','h1','h2','h3','h4','label','div'].includes(tag) && !isBtn;

      setRingClass(isBtn ? 'hover-btn' : isText ? 'hover-text' : '');
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    // Smooth ring follow with lag
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);

      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top  = `${pos.current.y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top  = `${ring.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className={`cursor-ring ${ringClass}`} />
    </>
  );
}
