import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function VisitTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/reset")) return;
    const key = "tracked:" + pathname;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch {}
    fetch("/api/security/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname, referrer: document.referrer || "direct", duration: 0 }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
