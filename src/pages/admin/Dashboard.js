import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRatings: 0,
    flagged: 0,
    pendingOfficials: 0,
    pendingRatings: 0,
  });

  const [newUsers, setNewUsers] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/counts").then(res => {
      setStats({
        totalRatings: 0,
        flagged: res.data.flagged_ratings,
        pendingOfficials: res.data.pending_entities,
        pendingRatings: res.data.unverified_ratings,
      });
    });

    api.get("/admin/users/new?days=7").then(res => {
      setNewUsers(res.data.length);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ================= SYSTEM OVERVIEW ================= */}
        <div className="constitution-card">
          <h2 className="text-xl font-bold mb-3">📊 System Overview</h2>
          <ul className="space-y-2 text-[15px] leading-relaxed">
            <li><strong>Flagged Ratings:</strong> {stats.flagged}</li>
            <li><strong>Pending Entities:</strong> {stats.pendingOfficials}</li>
            <li><strong>Unverified Ratings:</strong> {stats.pendingRatings}</li>
            <li>
              <strong>New Users (7 days):</strong>{" "}
              <span className="text-blue-700 font-semibold">
                {newUsers}
              </span>
            </li>
          </ul>
        </div>

        {/* ================= ADMIN ACTIONS ================= */}
        <div className="constitution-card">
          <h2 className="text-xl font-bold mb-3">🧭 Admin Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="constitution-btn"
            >
              👤 Review Users
            </button>

            <button
              onClick={() => navigate("/admin/entities")}
              className="constitution-btn"
            >
              🏛️ Review Entities
            </button>

            <button
              onClick={() => navigate("/admin/verify-officials")}
              className="constitution-btn"
            >
              🗳️ Verify Officials
            </button>

            <button
              onClick={() => navigate("/admin/verify-ratings")}
              className="constitution-btn"
            >
              ✅ Verify Ratings
            </button>

            <button
              onClick={() => navigate("/admin/evidence")}
              className="constitution-btn"
            >
              🧾 Evidence & Testimonies
            </button>

            <button
              onClick={() => navigate("/admin/policies")}
              className="constitution-btn"
            >
              📜 Policy Manager
            </button>
          </div>
        </div>

        {/* ================= CITIZEN VIEW ================= */}
        <div className="constitution-card">
          <h2 className="text-xl font-bold mb-2">
            🌐 Citizen View (Public App)
          </h2>

          <p className="text-sm text-[#5a4635] mb-4">
            Access the public-facing side of ARES to see exactly what
            citizens see. These links open the standard app views
            without admin controls.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/vault/public")}
              className="constitution-btn"
            >
              🌍 Community Records Feed
            </button>

            <button
              onClick={() => navigate("/ratings")}
              className="constitution-btn"
            >
              🏛️ Ratings Directory
            </button>

            <button
              onClick={() => navigate("/forum")}
              className="constitution-btn"
            >
              💬 Public Forum
            </button>

            <button
              onClick={() => navigate("/policies")}
              className="constitution-btn"
            >
              📜 Public Policies
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
