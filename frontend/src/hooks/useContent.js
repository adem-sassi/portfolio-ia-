import { useState, useEffect } from "react";

export function useContent() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content?t=" + Date.now())
      .then(r => r.json())
      .then(data => { setContent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { content, loading };
}
