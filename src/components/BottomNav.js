import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  if (!isAuthenticated) return null;

  const menuItems = [
    { label: "Know Your Rights", icon: "⚖️", path: "/rights" },
    { label: "Forum", icon: "🗣️", path: "/forum" },
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
          pb-6
          px-8

          flex
          items-end
          justify-between
        "
      >
        {/* VAULT PUBLIC */}
        <button
          onClick={() => navigate("/vault/public")}
          className="text-white text-2xl flex flex-col items-center"
        >
          📂
        </button>

        {/* RATINGS */}
        <button
          onClick={() => navigate("/ratings")}
          className="text-white text-2xl flex flex-col items-center"
        >
          📜
        </button>

        {/* CENTER ADD */}
        <button
          onClick={() => navigate("/vault/upload")}
          aria-label="Add Evidence"
          className="
            -mt-10
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
          className="text-white text-2xl flex flex-col items-center"
        >
          🗣️
        </button>

        {/* MENU */}
        <button
          onClick={() => setShowMore((v) => !v)}
          className="text-white text-3xl flex flex-col items-center"
        >
          ☰
        </button>
      </nav>
    </>
  );
}
