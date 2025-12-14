import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminPendingEntities() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  async function fetchEntities() {
    try {
      setLoading(true);
      const res = await api.get("/admin/entities/pending");
      setEntities(res.data);
    } catch (err) {
      console.error("Failed to load pending entities", err);
      alert("Failed to load pending entities");
    } finally {
      setLoading(false);
    }
  }

  async function approveEntity(id) {
    if (!window.confirm("Approve this entity?")) return;

    try {
      setActionId(id);
      await api.post(`/admin/entities/${id}/approve`);
      setEntities((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Approve failed", err);
      alert("Failed to approve entity");
    } finally {
      setActionId(null);
    }
  }

  async function rejectEntity(id) {
    if (!window.confirm("Reject this entity? This will hide it permanently.")) return;

    try {
      setActionId(id);
      await api.post(`/admin/entities/${id}/reject`);
      setEntities((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Reject failed", err);
      alert("Failed to reject entity");
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <div className="p-6">Loading pending entities…</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin · Pending Entities</h1>

      {entities.length === 0 && (
        <div className="text-gray-500">No entities awaiting review.</div>
      )}

      <div className="space-y-4">
        {entities.map((e) => (
          <div
            key={e.id}
            className="border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="text-sm text-gray-500">
              Entity #{e.id} · Created {new Date(e.created_at).toLocaleString()}
            </div>

            <div>
              <strong>Name:</strong> {e.name}
            </div>

            <div>
              <strong>Type:</strong> {e.type}
            </div>

            <div>
              <strong>Category:</strong> {e.category}
            </div>

            <div>
              <strong>Jurisdiction:</strong>{" "}
              {e.jurisdiction || "—"}
            </div>

            <div>
              <strong>Location:</strong>{" "}
              {e.county}, {e.state}
            </div>

            <div className="flex gap-4 mt-2">
              <button
                onClick={() => approveEntity(e.id)}
                disabled={actionId === e.id}
                className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-50"
              >
                Approve
              </button>

              <button
                onClick={() => rejectEntity(e.id)}
                disabled={actionId === e.id}
                className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
