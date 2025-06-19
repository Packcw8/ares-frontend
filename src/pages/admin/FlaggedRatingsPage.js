import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function FlaggedRatingsPage() {
  const [flagged, setFlagged] = useState([]);

  useEffect(() => {
    api
      .get("/ratings/admin/flagged-ratings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setFlagged(res.data))
      .catch((err) => console.error("Error fetching flagged ratings:", err));
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) return;

    try {
      await api.delete(`/ratings/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFlagged((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.post(`/ratings/verify/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFlagged((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to verify:", err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {flagged.length === 0 ? (
          <p className="italic text-center text-[#5a4635]">
            No flagged ratings at this time.
          </p>
        ) : (
          flagged.map((rating) => (
            <div key={rating.id} className="constitution-card">
              <h3 className="text-lg font-bold mb-2">🚩 Flagged Rating #{rating.id}</h3>
              <p><strong>Entity:</strong> {rating.entity_name || "Unknown"}</p>
              <p><strong>Reason:</strong> {rating.flag_reason || "N/A"}</p>
              <p><strong>Flagged By:</strong> {rating.flagged_by || "Anonymous"}</p>
              <p><strong>Comment:</strong> {rating.comment || "(No comment provided)"}</p>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => handleVerify(rating.id)} className="constitution-btn">
                  ✅ Verify
                </button>
                <button
                  onClick={() => handleRemove(rating.id)}
                  className="constitution-btn bg-red-600 hover:bg-red-700"
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
