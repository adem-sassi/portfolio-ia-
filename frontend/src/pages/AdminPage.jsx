import { useState, useEffect } from "react";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  // Vérifier si un token valide existe déjà
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (!savedToken) {
      setChecking(false);
      return;
    }

    fetch("/api/admin/verify", {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((r) => {
        if (r.ok) {
          setToken(savedToken);
        } else {
          localStorage.removeItem("admin_token");
        }
      })
      .catch(() => localStorage.removeItem("admin_token"))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-neural-blue animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={(t) => setToken(t)} />;
  }

  return (
    <AdminDashboard
      token={token}
      onLogout={() => setToken(null)}
    />
  );
}
