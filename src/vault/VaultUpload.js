import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultUpload() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const vaultEntryId = locationState?.vault_entry_id || null;

  // =====================
  // Vault entry state
  // =====================
  const [vaultEntry, setVaultEntry] = useState(null);
  const [entryText, setEntryText] = useState("");
  const [entryPublic, setEntryPublic] = useState(false);
  const [savingEntry, setSavingEntry] = useState(false);

  // =====================
  // Evidence state
  // =====================
  const [file, setFile] = useState(null);
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [evidenceList, setEvidenceList] = useState([]);

  // ======================================================
  // LOAD VAULT ENTRY
  // ======================================================
  useEffect(() => {
    if (!vaultEntryId) return;

    Promise.all([
      api.get("/vault-entries/mine"),
      api.get(`/vault-entries/${vaultEntryId}/evidence`)
    ])
      .then(([entriesRes, evidenceRes]) => {
        const entry = entriesRes.data.find(
          e => e.id === Number(vaultEntryId)
        );
        if (!entry) throw new Error();

        setVaultEntry(entry);
        setEntryText(entry.testimony || "");
        setEntryPublic(entry.is_public);
        setEvidenceList(evidenceRes.data || []);
      })
      .catch(() => {
        alert("Unable to load vault entry");
        navigate("/vault/mine");
      });
  }, [vaultEntryId, navigate]);

  // ======================================================
  // SAVE VAULT ENTRY (TEXT + VISIBILITY)
  // ======================================================
  const saveVaultEntry = async () => {
    if (!entryText.trim()) {
      alert("Description is required.");
      return;
    }

    setSavingEntry(true);
    try {
      const res = await api.patch(
        `/vault-entries/${vaultEntryId}`,
        {
          testimony: entryText,
          is_public: entryPublic,
        }
      );

      setVaultEntry(prev => ({
        ...prev,
        is_public: res.data.is_public,
        published_at: res.data.published_at,
      }));
    } catch {
      alert("Failed to save entry.");
    } finally {
      setSavingEntry(false);
    }
  };

  // ======================================================
  // UPLOAD EVIDENCE
  // ======================================================
  const submitEvidence = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Select a file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", evidenceDescription);
      formData.append("vault_entry_id", vaultEntryId);

      await api.post("/vault", formData);

      setFile(null);
      setEvidenceDescription("");

      const res = await api.get(
        `/vault-entries/${vaultEntryId}/evidence`
      );
      setEvidenceList(res.data || []);
    } catch {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* VAULT ENTRY EDITOR */}
        {vaultEntry && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">
              Vault Entry Description
            </h2>

            <textarea
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-xl border"
            />

            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!entryPublic}
                  onChange={() => setEntryPublic(false)}
                />
                Private
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={entryPublic}
                  onChange={() => setEntryPublic(true)}
                />
                Public
              </label>
            </div>

            <button
              onClick={saveVaultEntry}
              disabled={savingEntry}
              className="text-sm font-semibold text-indigo-600"
            >
              {savingEntry ? "Saving…" : "Save Entry"}
            </button>

            <p className="text-xs text-slate-500">
              All attached evidence inherits this visibility.
            </p>
          </div>
        )}

        {/* EVIDENCE UPLOAD */}
        <form onSubmit={submitEvidence} className="space-y-6">
          <div className="rounded-3xl border bg-slate-50 p-8 text-center">
            <label className="cursor-pointer block">
              <div className="text-4xl mb-2">📎</div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            {file && (
              <p className="text-sm mt-2">
                {file.name}
              </p>
            )}
          </div>

          <textarea
            placeholder="Optional evidence description"
            value={evidenceDescription}
            onChange={(e) =>
              setEvidenceDescription(e.target.value)
            }
            rows={3}
            className="w-full p-3 rounded-xl border"
          />

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={uploading}
              className="w-14 h-14 rounded-full bg-indigo-600 text-white text-2xl"
            >
              {uploading ? "…" : "+"}
            </button>
          </div>
        </form>

        {/* EVIDENCE LIST */}
        <div className="space-y-3">
          <h3 className="font-semibold">
            Attached Evidence ({evidenceList.length})
          </h3>

          {evidenceList.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border bg-white p-4"
            >
              <p className="text-sm truncate">
                {e.description || "Evidence file"}
              </p>
              <a
                href={e.blob_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 underline"
              >
                View
              </a>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
