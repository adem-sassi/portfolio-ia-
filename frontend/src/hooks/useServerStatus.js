import { useState, useEffect } from "react";

export function useServerStatus() {
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      setServerDown(true);
    }, 5000);

    fetch("https://web-production-cba0c.up.railway.app/api/content", {
      signal: controller.signal
    })
      .then(r => {
        clearTimeout(timeout);
        if (!r.ok) setServerDown(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        setServerDown(true);
      });
  }, []);

  return serverDown;
}
