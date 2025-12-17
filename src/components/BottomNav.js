import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const [showMenu, setShowMenu] = useState(false);
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
    <>
      {/* TOP RIGHT HAMBURGER */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="
            h-11
            w-11
            rounded-full
            bg-[#2c1b0f]
            border
            border-[#c2a76d]
            text-[#f5ecd9]
            text-2xl
            flex
            items-center
            justify-center
            shadow-lg
          "
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {showMenu && (
        <div
          className="
            fixed
            top-20
            right-4
            w-64
            bg-[#f5ecd9]
            border
            border-[#c2a76d]
            rounded-xl
            shadow-2xl
            z-50
            p-2
            space-y-1
          "
        >
          {[
            { label: "About ARES", path: "/about", icon: "🏛️" },
            { label: "Know Your Rights", path: "/rights", icon: "⚖️" },
            { label: "Community Rules", path: "/rules", icon: "📜" },
            { label: "Privacy Policy", path: "/privacy", icon: "📄" },
            { label: "Terms of Use", path: "/terms", icon: "🛡️" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setShowMenu(false);
                navigate(item.path);
              }}
              className="
                w-full
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-lg
                text-left
                text-[#3a2f1b]
                hover:bg-[#ede3cb]
                text-base
              "
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          <hr className="my-2 border-[#c2a76d]" />

          <button
            onClick={() => {
              localStorage.removeItem("token");
              setShowMenu(false);
              navigate("/login");
            }}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-lg
              text-left
              text-red-700
              hover:bg-red-100
              text-base
              font-medium
            "
          >
            🚪 Logout
          </button>
        </div>
      )}

      {/* BOTTOM NAV */}
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
        {/* PUBLIC VAULT */}
        <button
          onClick={() => navigate("/vault/public")}
          className={`${iconBase} ${
            isActive("/vault/public") ? iconActive : iconInactive
          } mb-2 text-2xl`}
        >
          📂
        </button>

        {/* RATINGS */}
        <button
          onClick={() => navigate("/ratings")}
          className={`${iconBase} ${
            isActive("/ratings") ? iconActive : iconInactive
          } mb-2 text-2xl`}
        >
          📜
        </button>

        {/* ADD */}
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

        {/* FORUM */}
        <button
          onClick={() => navigate("/forum")}
          className={`${iconBase} ${
            isActive("/forum") ? iconActive : iconInactive
          } mb-2 text-2xl`}
        >
          🗣️
        </button>

        {/* MY VAULT */}
        <button
          onClick={() => navigate("/vault/mine")}
          className={`${iconBase} ${
            isActive("/vault/mine") ? iconActive : iconInactive
          } mb-2 text-2xl`}
        >
          🔐
        </button>
      </nav>
    </>
  );
}
