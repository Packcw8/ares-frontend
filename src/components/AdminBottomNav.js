import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminBottomNav() {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "System Logs",
      icon: "📜",
      path: "/admin/logs",
    },
    {
      label: "Admin Logout",
      icon: "🚪",
      action: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
    },
  ];

  return (
    <>
      {/* Dropdown Menu */}
      {showMore && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-xs w-[90%] bg-[#f5ecd9] border border-[#c2a76d] shadow-xl rounded-lg p-3 z-50 space-y-2 font-serif">
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

      {/* Admin Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2c1b0f] text-[#fceabb] border-t-2 border-[#c2a76d] flex justify-around items-center py-5 px-3 z-40 text-lg font-serif tracking-wide">
        <button
          onClick={() => navigate("/admin/dashboard")}
          title="Civic Hub"
        >
          🏛️
        </button>

        <button
          onClick={() => navigate("/admin/flagged")}
          title="Flagged Ratings"
        >
          ⚠️
        </button>

        <button
          onClick={() => navigate("/admin/verify-officials")}
          title="Verify Officials"
        >
          🗳️
        </button>

        <button
          onClick={() => navigate("/admin/verify-ratings")}
          title="Verify Ratings"
        >
          ✅
        </button>

        {/* Entity Review */}
        <button
          onClick={() => navigate("/admin/entities")}
          title="Entity Review"
        >
          🏷️
        </button>

        {/* Evidence Review */}
        <button
          onClick={() => navigate("/admin/evidence")}
          title="Evidence Review"
        >
          🗂️
        </button>

        {/* 🆕 Policy Review */}
        <button
          onClick={() => navigate("/admin/policies")}
          title="Policy Review"
        >
          📜
        </button>

        <button
          onClick={() => setShowMore(!showMore)}
          className="text-xl"
          title="More"
        >
          ☰
        </button>
      </nav>
    </>
  );
}
