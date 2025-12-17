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

  const iconBase =
    "flex flex-col items-center justify-center transition-all duration-200";

  const iconActive =
    "text-[#f5ecd9] scale-110 drop-shadow-[0_0_6px_rgba(245,236,217,0.8)]";

  const iconInactive = "text-white/70 hover:text-white";

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        bg-[#2c1b0f]
        border-t
        border-[#c2a76d]
        z-40
        h-24
        pb-8
        px-8
        flex
        items-end
        justify-between
      "
    >
      <button
        onClick={() => navigate("/vault/public")}
        className={`${iconBase} ${
          isActive("/vault/public") ? iconActive : iconInactive
        } mb-2 text-2xl`}
      >
        📂
      </button>

      <button
        onClick={() => navigate("/ratings")}
        className={`${iconBase} ${
          isActive("/ratings") ? iconActive : iconInactive
        } mb-2 text-2xl`}
      >
        📜
      </button>

      <button
        onClick={() => navigate("/vault/upload")}
        aria-label="Add Public Record"
        className="
          -mt-12
          h-16
          w-16
          rounded-full
          bg-[#8b1e3f]
          hover:bg-[#72162f]
          border-4
          border-[#f5ecd9]
          text-white
          text-4xl
          flex
          items-center
          justify-center
          shadow-2xl
        "
      >
        +
      </button>

      <button
        onClick={() => navigate("/forum")}
        className={`${iconBase} ${
          isActive("/forum") ? iconActive : iconInactive
        } mb-2 text-2xl`}
      >
        🗣️
      </button>

      <button
        onClick={() => navigate("/vault/mine")}
        className={`${iconBase} ${
          isActive("/vault/mine") ? iconActive : iconInactive
        } mb-2 text-2xl`}
      >
        🔐
      </button>
    </nav>
  );
}
