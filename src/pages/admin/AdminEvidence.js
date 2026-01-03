import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function AdminEvidence() {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadEvidence();
  }, []);

  async function loadEvidence() {
    try {
      setLoading(true);
      const res = await api.get("/admin/evidence");
      setEvidence(res.data || []);
    } catch (err) {
      console.error("Failed to load evidence", err);
      alert("Failed to load evidence");
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvidence(id) {
    if (!window.confirm("Permanently delete this evidence file?")) return;
    setProcessingId(id);

    try {
      await api.delete(`/admin/evidence/${id}`);
      setEvidence((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Failed to delete evidence");
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteTestimony(vaultEntryId) {
    if (
      !window.confirm(
        "This will permanently delete the testimony AND all linked evidence.\n\nAre you sure?"
      )
    )
      return;

    setProcessingId(vaultEntryId);

    try {
      await api.delete(`/vault-entries/${vaultEntryId}`);
      setEvidence((prev) =>
        prev.filter((e) => e.vault_entry_id !== vaultEntryId)
      );
    } catch {
      alert("Failed to delete testimony");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <section className="constitution-card">
        <h2 className="text-2xl font-bold mb-2">
          🧾 Evidence & Testimony Moderation
        </h2>
        <p className="text-sm text-[#5a4635]">
          Review uploaded evidence and the testimonies they are attached to.
          Admins may remove individual files or entire submissions.
        </p>
      </section>

      {/* Loading */}
      {loading && (
        <div className="italic text-center text-[#5a4635]">
          Loading evidence…
        </div>
      )}

      {/* Empty */}
      {!loading && evidence.length === 0 && (
        <div className="constitution-card italic text-center">
          No evidence submissions found.
        </div>
      )}

      {/* Evidence List */}
      {!loading && (
        <div className="space-y-4">
          {evidence.map((e) => (
            <div key={e.id} className="constitution-card space-y-3">
              <div className="text-xs opacity-70">
                Evidence #{e.id} ·{" "}
                {new Date(e.created_at).toLocaleString()}
              </div>

              {e.entity_name && (
                <p className="text-sm">
                  <strong>Entity:</strong> {e.entity_name}{" "}
                  <span className="italic opacity-70">
                    ({e.entity_status})
                  </span>
                </p>
              )}

              {e.description && (
                <p className="text-sm">
                  <strong>Evidence description:</strong>{" "}
                  {e.description}
                </p>
              )}

              {/* =====================
                  Testimony Preview
                 ===================== */}
              {e.testimony && (
                <div className="bg-white/60 border rounded p-3">
                  <p className="text-xs font-semibold mb-1">
                    Linked Testimony
                  </p>

                  <p className="text-sm whitespace-pre-line line-clamp-4">
                    {e.testimony}
                  </p>

                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() =>
                        deleteTestimony(e.vault_entry_id)
                      }
                      disabled={
                        processingId === e.vault_entry_id
                      }
                      className="constitution-btn bg-red-700 hover:bg-red-800"
                    >
                      🗑 Delete Testimony
                    </button>
                  </div>
                </div>
              )}

              {/* =====================
                  Actions
                 ===================== */}
              <div className="flex flex-wrap gap-3 justify-end pt-2">
                <a
                  href={e.blob_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="constitution-btn"
                >
                  View File
                </a>

                <button
                  onClick={() => deleteEvidence(e.id)}
                  disabled={processingId === e.id}
                  className="constitution-btn bg-red-700 hover:bg-red-800"
                >
                  {processingId === e.id
                    ? "Processing…"
                    : "Delete Evidence"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
