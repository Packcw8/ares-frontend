import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function VerifyOfficialsPage() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    api
      .get("/users/unverified-officials", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setPending(res.data))
      .catch((err) => console.error("Error loading pending officials:", err));
  }, []);

  const handleVerify = async (id) => {
    try {
      await api.post(`/users/verify/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPending((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {pending.length === 0 ? (
          <p className="italic text-center text-[#5a4635]">
            No pending officials to verify.
          </p>
        ) : (
          pending.map((user) => (
            <div key={user.id} className="constitution-card">
              <h3 className="text-lg font-bold mb-1">🗳️ {user.username}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Requested Role:</strong> Official</p>

              <div className="flex justify-end mt-4">
                <button onClick={() => handleVerify(user.id)} className="constitution-btn">
                  ✅ Verify Official
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
