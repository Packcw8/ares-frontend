import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultUpload() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  // ======================================================
  // VAULT ENTRY CONTEXT
  // ======================================================
  const initialEntryId = locationState?.vault_entry_id || null;
  const [vaultEntryId, setVaultEntryId] = useState(initialEntryId);
  const isNewEntry = !vaultEntryId;

  // ======================================================
  // VAULT ENTRY STATE
  // ======================================================
  const [testimony, setTestimony] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [savingEntry, setSavingEntry] = useState(false);

  // ======================================================
  // EVIDENCE STATE
  // ======================================================
  const [file, setFile] = useState(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [evidenceList, setEvidenceList] = useState([]);

  // ======================================================
  // LOAD EXISTING ENTRY
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
        if (!entry) throw new Error("Entry not found");

        setTestimony(entry.testimony || "");
        setIsPublic(entry.is_public);
        setEvidenceList(evidenceRes.data || []);
      })
      .catch(() => {
        alert("Unable to load vault entry.");
        navigate("/vault/mine");
      });
  }, [vaultEntryId, navigate]);

  // ======================================================
  // CREATE OR UPDATE ENTRY
  // ======================================================
  const saveEntry = async () => {
    if (!testimony.trim()) {
      alert("Testimony is required.");
      return;
    }

    setSavingEntry(true);
    try {
      if (isNewEntry) {
        const res = await api.post("/vault-entries", {
          testimony,
          is_public: isPublic,
        });

        setVaultEntryId(res.data.id);
        navigate("/vault/upload", {
          state: { vault_entry_id: res.data.id },
          replace: true,
        });
      } else {
        await api.patch(`/vault-entries/${vaultEntryId}`, {
          testimony,
          is_public: isPublic,
        });
      }
    } catch {
      alert("Failed to save testimony.");
    } finally {
      setSavingEntry(false);
    }
  };

  // ======================================================
  // UPLOAD EVIDENCE
  // ======================================================
  const submitEvidence = async (e) => {
    e.preventDefault();

    if (!vaultEntryId) {
      alert("Save the testimony before attaching evidence.");
      return;
    }

    if (!file) {
      alert("Select a file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", evidenceNote);
      formData.append("vault_entry_id", vaultEntryId);

      await api.post("/vault", formData);

      setFile(null);
      setEvidenceNote("");

      const res = await api.get(
        `/vault-entries/${vaultEntryId}/evidence`
      );
      setEvidenceList(res.data || []);
    } catch {
      alert("Evidence upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">

        {/* ======================================================
            TESTIMONY (PRIMARY RECORD)
           ====================================================== */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Testimony
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              This is the written record. Attach media below as evidence.
            </p>
          </div>

          <textarea
            value={testimony}
            onChange={(e) => setTestimony(e.target.value)}
            rows={6}
            placeholder="Describe what happened, in your own words…"
            className="w-full p-4 rounded-xl border text-sm leading-relaxed"
          />

          <div className="flex flex-wrap gap-6 items-center pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
              />
              Private
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
              />
              Public
            </label>

            <span className="text-xs text-slate-500">
              All attached evidence follows this setting
            </span>
          </div>

          <button
            onClick={saveEntry}
            disabled={savingEntry}
            className="text-sm font-semibold text-indigo-600"
          >
            {savingEntry
              ? "Saving…"
              : isNewEntry
                ? "Create Record"
                : "Save Changes"}
          </button>
        </section>

        {/* ======================================================
            ATTACH EVIDENCE
           ====================================================== */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Attach Evidence
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload photos, videos, audio, or documents that support this testimony.
            </p>
          </div>

          <form onSubmit={submitEvidence} className="space-y-6">
            <div className="rounded-3xl border bg-slate-50 p-10 text-center">
              <label className="cursor-pointer block">
                <div className="text-5xl mb-3">📎</div>
                <p className="text-sm font-medium">
                  Click to attach evidence
                </p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              {file && (
                <p className="text-xs mt-3 text-slate-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <textarea
              placeholder="Optional note about this piece of evidence"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl border text-sm"
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
        </section>

        {/* ======================================================
            ATTACHED EVIDENCE LIST
           ====================================================== */}
        {vaultEntryId && (
          <section className="space-y-4">
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
          </section>
        )}
      </div>
    </Layout>
  );
}
