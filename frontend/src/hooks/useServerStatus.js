import { useState, useEffect } from "react";

const API_URL = "https://web-production-cba0c.up.railway.app";

export function useServerStatus() {
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(r => { if (!r.ok) setServerDown(true); })
      .catch(() => setServerDown(true));
  }, []);

  return serverDown;
}
