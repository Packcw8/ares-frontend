import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let mounted = true;

    api
      .get("/auth/me")
      .then((res) => {
        if (!mounted) return;
        setAllowed(res.data.role === "admin");
      })
      .catch(() => {
        if (!mounted) return;
        setAllowed(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (allowed === null) {
    return <div className="p-6">Checking permissions…</div>;
  }

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
