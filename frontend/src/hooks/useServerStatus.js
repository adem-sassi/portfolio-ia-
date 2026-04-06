import { useState, useEffect } from "react";

export function useServerStatus() {
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch("https://web-production-cba0c.up.railway.app/api/content")
        .then(r => {
          if (r.status >= 500) setServerDown(true);
        })
        .catch(() => setServerDown(true));
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return serverDown;
}
