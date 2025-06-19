import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRatings: 0,
    flagged: 0,
    pendingOfficials: 0,
    pendingRatings: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Placeholder — replace with real API data later
    setStats({
      totalRatings: 124,
      flagged: 3,
      pendingOfficials: 2,
      pendingRatings: 5,
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Card */}
        <div className="constitution-card">
          <h2 className="text-xl font-bold mb-3">📊 System Overview</h2>
          <ul className="space-y-2 text-[15px] leading-relaxed">
            <li><strong>Total Ratings:</strong> {stats.totalRatings}</li>
            <li><strong>Flagged Ratings:</strong> {stats.flagged}</li>
            <li><strong>Pending Officials:</strong> {stats.pendingOfficials}</li>
            <li><strong>Pending Ratings:</strong> {stats.pendingRatings}</li>
          </ul>
        </div>

        {/* Quick Action Buttons */}
        <div className="constitution-card">
          <h2 className="text-xl font-bold mb-3">🧭 Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/flagged")}
              className="constitution-btn"
            >
              ⚠️ Review Flagged Ratings
            </button>
            <button
              onClick={() => navigate("/admin/verify-officials")}
              className="constitution-btn"
            >
              🗳️ Verify New Officials
            </button>
            <button
              onClick={() => navigate("/admin/verify-ratings")}
              className="constitution-btn"
            >
              ✅ Approve New Ratings
            </button>
            <button
              onClick={() => navigate("/admin/logs")}
              className="constitution-btn"
            >
              📜 System Logs
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
