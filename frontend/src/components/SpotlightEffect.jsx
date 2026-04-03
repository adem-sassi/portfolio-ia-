import { useEffect, useRef } from "react";

export default function SpotlightEffect() {
  const spotlightRef = useRef(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;

    const onMove = (e) => {
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
      el.style.opacity = "1";
    };

    const onLeave = () => { el.style.opacity = "0"; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="fixed pointer-events-none z-0 opacity-0 transition-opacity duration-300"
      style={{
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
      }}
    />
  );
}
