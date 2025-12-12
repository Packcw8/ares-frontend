import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function VerifyOfficialsPage() {
  const [pending, setPending] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/admin/officials/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setPending(res.data))
      .catch((err) =>
        console.error("Error loading pending officials:", err)
      );
  }, [token]);

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      await api.patch(
        `/admin/officials/${id}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove verified user from list
      setPending((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify official. Check logs.");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Verify Officials
        </h2>

        {pending.length === 0 ? (
          <p className="italic text-center text-[#5a4635]">
            No officials awaiting verification.
          </p>
        ) : (
          pending.map((user) => (
            <div key={user.id} className="constitution-card">
              <h3 className="text-lg font-bold mb-2">
                🏛️ {user.full_name || user.username}
              </h3>

              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Account Email:</strong> {user.email}</p>
              <p><strong>Official Title:</strong> {user.title}</p>
              <p><strong>Agency:</strong> {user.agency}</p>
              <p><strong>State:</strong> {user.state}</p>
              <p><strong>Jurisdiction:</strong> {user.jurisdiction}</p>
              <p>
                <strong>Email Verified:</strong>{" "}
                {user.is_email_verified ? "Yes" : "No"}
              </p>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleVerify(user.id)}
                  disabled={verifyingId === user.id}
                  className="constitution-btn disabled:opacity-60"
                >
                  {verifyingId === user.id
                    ? "Verifying..."
                    : "✅ Verify Official"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
