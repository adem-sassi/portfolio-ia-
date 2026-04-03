import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
      <div
        className="h-full transition-all duration-75"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--neural-blue), var(--neural-violet), var(--neural-pink))",
          boxShadow: "0 0 8px var(--neural-blue)",
        }}
      />
    </div>
  );
}
