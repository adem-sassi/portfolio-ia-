import { useState, useEffect } from "react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export function useServerStatus() {
  const [serverDown, setServerDown] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      setServerDown(true);
      setChecked(true);
    }, 5000);

    fetch(`${API_URL}/api/content`, { signal: controller.signal })
      .then(r => {
        clearTimeout(timeout);
        if (!r.ok) {
          setServerDown(true);
        }
        setChecked(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        setServerDown(true);
        setChecked(true);
      });
  }, []);

  return { serverDown, checked };
}
