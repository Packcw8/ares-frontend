import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { label: "About ARES", icon: "🏛️", path: "/about" },
    { label: "Know Your Rights", icon: "⚖️", path: "/rights" },
    { label: "Forum", icon: "🗣️", path: "/forum" },
    { label: "Community Rules", icon: "📜", path: "/rules" },
    { label: "Privacy Policy", icon: "📄", path: "/privacy" },
    { label: "Terms of Use", icon: "🛡️", path: "/terms" },
    {
      label: "Logout",
      icon: "🚪",
      action: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
    },
  ];

  const iconBase =
    "flex flex-col items-center justify-center transition-all duration-200";

  const iconActive =
    "text-[#f5ecd9] scale-110 drop-shadow-[0_0_6px_rgba(245,236,217,0.8)]";

  const iconInactive = "text-white/70 hover:text-white";

  return (
    <>
      {/* MORE MENU */}
      {showMore && (
        <div
          className="
            fixed
            bottom-32
            left-1/2
            -translate-x-1/2
            w-[92%]
            max-w-sm
            bg-[#f5ecd9]
            border
            border-[#c2a76d]
            rounded-xl
            shadow-2xl
            z-50
            p-3
            space-y-1
          "
        >
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setShowMore(false);
                item.action ? item.action() : navigate(item.path);
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
        {/* VAULT PUBLIC */}
        <button
          onClick={() => navigate("/vault/public")}
          className={`${iconBase} ${
            isActive("/vault") ? iconActive : iconInactive
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

        {/* CENTER ADD */}
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

        {/* MENU */}
        <button
          onClick={() => setShowMore((v) => !v)}
          className={`${iconBase} ${
            showMore ? iconActive : iconInactive
          } mb-2 text-3xl`}
        >
          ☰
        </button>
      </nav>
    </>
  );
}
