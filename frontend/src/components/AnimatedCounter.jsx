import { useEffect, useState, useRef } from "react";

export default function AnimatedCounter({ target, duration = 2000, suffix = "" }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  // Extract numeric part
  const num = parseFloat(target?.toString().replace(/[^0-9.]/g, "") || "0");
  const prefix = target?.toString().replace(/[0-9.]+.*/, "") || "";
  const suf = target?.toString().replace(/^[^0-9]*[0-9.]+/, "") || suffix;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * num * 10) / 10);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [num, duration]);

  return (
    <span ref={ref}>
      {prefix}{Number.isInteger(num) ? Math.round(value) : value.toFixed(1)}{suf}
    </span>
  );
}
