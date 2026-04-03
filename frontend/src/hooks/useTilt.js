import { useRef, useCallback } from "react";

export function useTilt(intensity = 8) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02,1.02,1.02)`;
    el.style.transition = "transform 0.05s ease";
    // Glow effect
    const glowX = (x + 0.5) * 100;
    const glowY = (y + 0.5) * 100;
    el.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0,212,255,0.06), transparent 60%), rgba(0,212,255,0.03)`;
  }, [intensity]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.5s ease, background 0.5s ease";
    el.style.background = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
