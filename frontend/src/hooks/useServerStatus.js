import { useState, useEffect } from "react";

export function useServerStatus() {
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 8000);

    fetch("https://web-production-cba0c.up.railway.app/api/content", {
      signal: controller.signal
    })
      .then(r => {
        clearTimeout(timeout);
        if (r.status >= 500) setServerDown(true);
      })
      .catch((e) => {
        clearTimeout(timeout);
        if (e.name !== 'AbortError') setServerDown(true);
      });
  }, []);

  return serverDown;
}
