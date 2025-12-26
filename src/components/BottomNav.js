import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname.startsWith(path);

  const base = "flex flex-col items-center justify-center transition-all duration-200";
  const active = "text-indigo-600 scale-110";
  const inactive = "text-slate-400 hover:text-slate-600";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-t border-slate-200 h-20 px-6 flex items-center justify-between">

      <NavButton
        label="Public"
        icon="📂"
        onClick={() => navigate("/vault/public")}
        active={isActive("/vault/public")}
      />

      <NavButton
        label="Ratings"
        icon="📜"
        onClick={() => navigate("/ratings")}
        active={isActive("/ratings")}
      />

      {/* CENTER ACTION */}
      <button
        onClick={() => navigate("/vault/upload")}
        aria-label="Add Record"
        className="-mt-8 h-16 w-16 rounded-full bg-indigo-600 text-white text-3xl flex items-center justify-center shadow-xl active:scale-95"
      >
        +
      </button>

      <NavButton
        label="Forum"
        icon="💬"
        onClick={() => navigate("/forum")}
        active={isActive("/forum")}
      />

      <NavButton
        label="My Vault"
        icon="🔒"
        onClick={() => navigate("/vault/mine")}
        active={isActive("/vault/mine")}
      />
    </nav>
  );
}

function NavButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center text-xs ${active ? "text-indigo-600" : "text-slate-400"}`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="mt-1">{label}</span>
    </button>
  );
}
