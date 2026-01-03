import { useLocation, useNavigate } from "react-router-dom";

export default function BrowseSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();

  const isRatings = location.pathname.startsWith("/ratings");
  const isPolicies = location.pathname.startsWith("/policies");

  return (
    <div className="inline-flex rounded-xl overflow-hidden border border-[#c2a76d] bg-[#ede3cb]">
      <button
        onClick={() => navigate("/ratings")}
        className={`px-4 py-2 text-sm font-semibold transition ${
          isRatings
            ? "bg-[#8b1e3f] text-white"
            : "text-[#5a4635] hover:bg-[#e0d4b5]"
        }`}
      >
        Ratings
      </button>

      <button
        onClick={() => navigate("/policies")}
        className={`px-4 py-2 text-sm font-semibold transition ${
          isPolicies
            ? "bg-[#8b1e3f] text-white"
            : "text-[#5a4635] hover:bg-[#e0d4b5]"
        }`}
      >
        Policies
      </button>
    </div>
  );
}
