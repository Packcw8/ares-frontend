import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminEvidence() {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchEvidence();
  }, []);

  async function fetchEvidence() {
    try {
      setLoading(true);
      const res = await api.get("/admin/evidence");
      setEvidence(res.data);
    } catch (err) {
      console.error("Failed to load evidence", err);
      alert("Failed to load evidence");
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvidence(id) {
    const confirm = window.confirm(
      "Are you sure you want to permanently delete this evidence?"
    );
    if (!confirm) return;

    try {
      setDeletingId(id);
      await api.delete(`/admin/evidence/${id}`);
      setEvidence((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete evidence");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="p-4">Loading evidence…</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin · Evidence</h1>

      {evidence.length === 0 && (
        <div className="text-gray-500">No evidence found.</div>
      )}

      <div className="space-y-4">
        {evidence.map((e) => (
          <div
            key={e.id}
            className="border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="text-sm text-gray-500">
              Evidence #{e.id} · {new Date(e.created_at).toLocaleString()}
            </div>

            {e.entity_name && (
              <div className="text-sm">
                <strong>Entity:</strong> {e.entity_name}{" "}
                <span className="italic text-gray-500">
                  ({e.entity_status})
                </span>
              </div>
            )}

            {e.description && (
              <div className="text-sm">
                <strong>Description:</strong> {e.description}
              </div>
            )}

            {e.tags && (
              <div className="text-sm">
                <strong>Tags:</strong> {e.tags}
              </div>
            )}

            {e.location && (
              <div className="text-sm">
                <strong>Location:</strong> {e.location}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <a
                href={e.blob_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View file
              </a>

              <button
                onClick={() => deleteEvidence(e.id)}
                disabled={deletingId === e.id}
                className="text-red-600 text-sm disabled:opacity-50"
              >
                {deletingId === e.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
