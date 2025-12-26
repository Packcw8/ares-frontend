import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultUpload() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  // 🔗 Vault context
  const vaultEntryId = locationState?.vault_entry_id || null;

  // =====================
  // Upload state
  // =====================
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [entityId, setEntityId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [uploading, setUploading] = useState(false);

  // =====================
  // Vault entry state
  // =====================
  const [vaultEntry, setVaultEntry] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  // =====================
  // Entity search (legacy)
  // =====================
  const [entities, setEntities] = useState([]);
  const [entitySearch, setEntitySearch] = useState("");
  const [entitySelected, setEntitySelected] = useState(false);

  // ======================================================
  // LOAD VAULT ENTRY + EVIDENCE (VAULT MODE)
  // ======================================================
  useEffect(() => {
    if (!vaultEntryId) return;

    setLoadingEntry(true);

    Promise.all([
      api.get("/vault-entries/mine"),
      api.get(`/vault-entries/${vaultEntryId}/evidence`)
    ])
      .then(([entriesRes, evidenceRes]) => {
        const entry = entriesRes.data.find(
          e => e.id === Number(vaultEntryId)
        );
        if (!entry) throw new Error("Entry not found");

        setVaultEntry(entry);
        setEvidenceList(evidenceRes.data || []);
      })
      .catch(() => {
        alert("Unable to load vault entry.");
        navigate("/vault/mine");
      })
      .finally(() => setLoadingEntry(false));
  }, [vaultEntryId, navigate]);

  // ======================================================
  // LOAD ENTITIES (LEGACY MODE ONLY)
  // ======================================================
  useEffect(() => {
    if (vaultEntryId) return;

    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data || []))
      .catch(() => {});
  }, [vaultEntryId]);

  const filteredEntities = useMemo(() => {
    if (vaultEntryId) return [];
    const q = entitySearch.trim().toLowerCase();
    if (!q) return [];
    return entities.filter((e) =>
      `${e.name} ${e.state || ""} ${e.county || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [entitySearch, entities, vaultEntryId]);

  // ======================================================
  // TOGGLE ENTRY VISIBILITY
  // ======================================================
  const toggleEntryVisibility = async () => {
    if (!vaultEntry) return;

    setUpdatingVisibility(true);
    try {
      const makePublic = !vaultEntry.is_public;
      const res = await api.patch(
        `/vault-entries/${vaultEntry.id}/visibility`,
        null,
        { params: { make_public: makePublic } }
      );

      setVaultEntry(prev => ({
        ...prev,
        is_public: res.data.is_public,
        published_at: res.data.published_at
      }));
    } catch {
      alert("Failed to update visibility.");
    } finally {
      setUpdatingVisibility(false);
    }
  };

  // ======================================================
  // SUBMIT EVIDENCE
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("A file is required.");
      return;
    }

    if (!vaultEntryId && !entityId) {
      alert("An entity is required.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("location", location);
      formData.append("is_anonymous", isAnonymous);

      if (vaultEntryId) {
        formData.append("vault_entry_id", vaultEntryId);
      } else {
        formData.append("entity_id", entityId);
        formData.append("is_public", isPublic);
      }

      await api.post("/vault", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      setDescription("");

      if (vaultEntryId) {
        const res = await api.get(`/vault-entries/${vaultEntryId}/evidence`);
        setEvidenceList(res.data || []);
      } else {
        navigate("/vault/public");
      }
    } catch {
      alert("Submission failed.");
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* VAULT ENTRY HEADER */}
        {vaultEntry && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    vaultEntry.is_public
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {vaultEntry.is_public ? "Public Record" : "Private Record"}
                </span>

                <p className="mt-2 text-xs text-slate-500">
                  All attached evidence follows this visibility.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleEntryVisibility}
                disabled={updatingVisibility}
                className="text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50"
              >
                {vaultEntry.is_public ? "Make Private" : "Publish"}
              </button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-slate-800 whitespace-pre-wrap">
                {vaultEntry.testimony}
              </p>
            </div>
          </div>
        )}

        {/* FILE UPLOAD */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-3xl border bg-[#f7f1e1] p-12 text-center shadow-md">
            <label className="cursor-pointer block">
              <div className="text-5xl mb-3">📎</div>
              <p className="font-medium">Add supporting media</p>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            {file && (
              <p className="mt-4 text-sm opacity-80">
                Selected: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          {!vaultEntryId && (
            <div className="space-y-3 relative">
              <input
                placeholder="Search entity"
                value={entitySearch}
                onChange={(e) => {
                  setEntitySearch(e.target.value);
                  setEntityId("");
                  setEntitySelected(false);
                }}
                className="w-full p-3 rounded-xl border"
              />

              {entitySearch && !entitySelected && (
                <div className="absolute z-30 w-full bg-white border rounded-xl shadow max-h-64 overflow-y-auto">
                  {filteredEntities.slice(0, 8).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setEntityId(e.id);
                        setEntitySearch(e.name);
                        setEntitySelected(true);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-100"
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <textarea
            placeholder="Optional evidence description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border"
          />

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={uploading}
              className="w-16 h-16 rounded-full bg-indigo-600 text-white text-3xl font-bold shadow-lg"
            >
              {uploading ? "…" : "+"}
            </button>
          </div>
        </form>

        {/* ATTACHED EVIDENCE */}
        {vaultEntry && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Attached Evidence ({evidenceList.length})
            </h2>

            {evidenceList.length === 0 && (
              <p className="text-sm text-slate-500">
                No evidence attached yet.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidenceList.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <p className="text-sm font-medium truncate">
                    {e.description || "Evidence file"}
                  </p>
                  <a
                    href={e.blob_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    View file
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
