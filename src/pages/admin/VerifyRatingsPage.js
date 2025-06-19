import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function VerifyRatingsPage() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    api
      .get("/ratings/unverified", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setPending(res.data))
      .catch((err) => console.error("Failed to load pending ratings:", err));
  }, []);

  const handleVerify = async (id) => {
    try {
      await api.post(`/ratings/verify-rating/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPending((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this rating?")) return;

    try {
      await api.delete(`/ratings/delete-rating/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPending((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {pending.length === 0 ? (
          <p className="italic text-center text-[#5a4635]">
            No unverified ratings pending approval.
          </p>
        ) : (
          pending.map((rating) => (
            <div key={rating.id} className="constitution-card">
              <h3 className="text-lg font-bold mb-2">📜 Rating #{rating.id}</h3>
              <p><strong>Entity:</strong> {rating.entity_name || "Unknown"}</p>
              <p><strong>Submitted By:</strong> {rating.user_id ? `User #${rating.user_id}` : "Anonymous"}</p>
              <p><strong>Comment:</strong> {rating.comment || "No comment provided."}</p>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => handleVerify(rating.id)} className="constitution-btn">
                  ✅ Approve
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
