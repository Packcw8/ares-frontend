import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  if (!isAuthenticated) return null;

  const menuItems = [
    { label: "Know Your Rights", icon: "⚖️", path: "/rights" },
    { label: "Privacy Policy", icon: "📄", path: "/privacy" },
    { label: "Terms of Use", icon: "🛡️", path: "/terms" },
    { label: "Forum", icon: "🗣️", path: "/forum" },
    {
      label: "Logout",
      icon: "🚪",
      action: () => {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  ];

  return (
    <>
      {/* Dropdown Menu */}
      {showMore && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-xs w-[90%] bg-[#f5ecd9] border border-[#c2a76d] shadow-xl rounded-lg p-3 z-50 space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setShowMore(false);
                item.action ? item.action() : navigate(item.path);
              }}
              className="w-full flex items-center space-x-3 text-left text-[#3a2f1b] hover:bg-[#ede3cb] px-3 py-2 rounded transition"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2c1b0f] text-white border-t border-[#c2a76d] flex justify-around items-center py-5 px-2 z-40 text-base font-serif tracking-wide">
        <button onClick={() => navigate("/dashboard")}>🏛️</button>
        <button onClick={() => navigate("/ratings")}>📜</button>
        <button onClick={() => navigate("/vault/public")}>📍</button>
        <button onClick={() => navigate("/vault/upload")}>📤</button>
        <button onClick={() => navigate("/ratings/new")}>🧑‍⚖️</button>
        <button onClick={() => setShowMore(!showMore)} className="text-xl">☰</button>
      </nav>
    </>
  );
}
