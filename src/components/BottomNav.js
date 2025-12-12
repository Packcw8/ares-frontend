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

  /* =========================
     MOBILE BOTTOM NAV
     ========================= */
  return (
    <>
      {/* MORE MENU */}
      {showMore && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-[#f5ecd9] border border-[#c2a76d] rounded-xl shadow-xl z-50 p-3 space-y-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setShowMore(false);
                item.action ? item.action() : navigate(item.path);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[#3a2f1b] hover:bg-[#ede3cb]"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* MOBILE NAV */}
      <nav
        className="
          fixed bottom-0 left-0 right-0
          md:hidden
          bg-[#2c1b0f]
          border-t border-[#c2a76d]
          h-16
          z-40
          flex
          items-center
          justify-between
          px-6
        "
      >
        {/* LEFT */}
        <button
          onClick={() => navigate("/vault/public")}
          className="flex flex-col items-center text-white text-lg"
        >
          📂
        </button>

        <button
          onClick={() => navigate("/ratings")}
          className="flex flex-col items-center text-white text-lg"
        >
          📜
        </button>

        {/* CENTER ADD BUTTON */}
        <button
          onClick={() => navigate("/vault/upload")}
          className="
            -mt-8
            h-14 w-14
            rounded-full
            bg-[#8b1e3f]
            hover:bg-[#72162f]
            border-4 border-[#f5ecd9]
            text-white
            text-3xl
            flex
            items-center
            justify-center
            shadow-xl
          "
          aria-label="Add Evidence"
        >
          +
        </button>

        {/* RIGHT */}
        <button
          onClick={() => navigate("/forum")}
          className="flex flex-col items-center text-white text-lg"
        >
          🗣️
        </button>

        <button
          onClick={() => setShowMore((v) => !v)}
          className="flex flex-col items-center text-white text-xl"
        >
          ☰
        </button>
      </nav>

      {/* =========================
          DESKTOP LEFT NAV (OPTIONAL)
          ========================= */}
      <aside
        className="
          hidden md:flex
          fixed
          left-0 top-0 bottom-0
          w-16
          bg-[#2c1b0f]
          border-r border-[#c2a76d]
          z-30
          flex-col
          items-center
          justify-center
          gap-6
        "
      >
        <button onClick={() => navigate("/vault/public")} className="text-white text-xl">
          📂
        </button>
        <button onClick={() => navigate("/ratings")} className="text-white text-xl">
          📜
        </button>
        <button
          onClick={() => navigate("/vault/upload")}
          className="text-white text-2xl font-bold"
        >
          +
        </button>
        <button onClick={() => navigate("/forum")} className="text-white text-xl">
          🗣️
        </button>
        <button onClick={() => setShowMore(true)} className="text-white text-xl">
          ☰
        </button>
      </aside>
    </>
  );
}
