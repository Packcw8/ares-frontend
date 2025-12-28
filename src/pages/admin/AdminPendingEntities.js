import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function AdminPendingEntities() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("under_review");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntities();
  }, []);

  async function fetchEntities() {
    try {
      setLoading(true);
      const res = await api.get("/admin/entities");
      setEntities(res.data || []);
    } catch (err) {
      console.error("Failed to load entities", err);
      alert("Failed to load entities");
    } finally {
      setLoading(false);
    }
  }

  const filteredEntities = entities.filter(
    (e) => e.approval_status === activeTab
  );

  async function approveEntity(id) {
    if (!window.confirm("Approve and publish this entity?")) return;
    await api.post(`/admin/entities/${id}/approve`);
    fetchEntities();
  }

  async function rejectEntity(id) {
    if (!window.confirm("Reject and permanently hide this entity?")) return;
    await api.post(`/admin/entities/${id}/reject`);
    fetchEntities();
  }

  async function retireEntity(id) {
    if (!window.confirm("Retire this entity? It will be hidden but preserved.")) return;
    await api.post(`/admin/entities/${id}/retire`);
    fetchEntities();
  }

  async function saveEdit() {
    try {
      setSaving(true);

      const { id, name, category, jurisdiction, state, county } = editing;

      await api.patch(`/admin/entities/${id}`, {
        name,
        category,
        jurisdiction,
        state,
        county,
      });

      setEditing(null);
      fetchEntities();
    } catch (err) {
      console.error("Failed to save entity edits", err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <section className="constitution-card">
        <h2 className="text-2xl font-bold mb-2">🏷️ Entity Manager</h2>
        <p className="text-sm text-[#5a4635]">
          Review, approve, edit, or retire entities. Approved entities become part
          of the public accountability record and cannot be deleted.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          ["under_review", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
          ["retired", "Retired"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`constitution-btn ${
              activeTab === key ? "bg-[#283d63] text-white" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="italic text-center text-[#5a4635]">
          Loading entities…
        </div>
      )}

      {/* Empty */}
      {!loading && filteredEntities.length === 0 && (
        <div className="constitution-card text-center italic">
          No entities in this category.
        </div>
      )}

      {/* Entity Cards */}
      <div className="space-y-4">
        {filteredEntities.map((e) => (
          <div key={e.id} className="constitution-card">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-bold">{e.name}</h3>
                <p className="text-xs text-[#5a4635]">
                  {e.type} · {e.category || "—"}
                </p>
                <p className="text-xs">
                  {e.county ? `${e.county}, ` : ""}
                  {e.state}
                </p>
                <p className="text-xs italic mt-1">
                  Jurisdiction: {e.jurisdiction || "—"}
                </p>
              </div>

              <span className="text-xs px-2 py-1 rounded border capitalize">
                {e.approval_status.replace("_", " ")}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-end mt-4">
              {e.approval_status === "under_review" && (
                <>
                  <button
                    onClick={() => approveEntity(e.id)}
                    className="constitution-btn bg-green-700 hover:bg-green-800"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => rejectEntity(e.id)}
                    className="constitution-btn bg-red-700 hover:bg-red-800"
                  >
                    ❌ Reject
                  </button>
                </>
              )}

              {e.approval_status === "approved" && (
                <>
                  <button
                    onClick={() => setEditing({ ...e })}
                    className="constitution-btn"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => retireEntity(e.id)}
                    className="constitution-btn bg-yellow-700 hover:bg-yellow-800"
                  >
                    💤 Retire
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="constitution-card max-w-md w-full">
            <h3 className="text-lg font-bold mb-3">Edit Entity</h3>

            {["name", "category", "jurisdiction", "state", "county"].map(
              (field) => (
                <input
                  key={field}
                  className="w-full mb-2"
                  placeholder={field}
                  value={editing[field] || ""}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                />
              )
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditing(null)}
                className="constitution-btn"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="constitution-btn bg-green-700 hover:bg-green-800 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
