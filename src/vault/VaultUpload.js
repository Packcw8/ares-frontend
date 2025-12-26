import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultUpload() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const initialEntryId = locationState?.vault_entry_id || null;
  const [vaultEntryId, setVaultEntryId] = useState(initialEntryId);
  const isNewEntry = !vaultEntryId;

  // =====================
  // CORE RECORD STATE
  // =====================
  const [testimony, setTestimony] = useState("");
  const [entityId, setEntityId] = useState(null);
  const [entitySearch, setEntitySearch] = useState("");
  const [entityResults, setEntityResults] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  // =====================
  // EVIDENCE
  // =====================
  const [file, setFile] = useState(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidenceList, setEvidenceList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // =====================
  // LOAD EXISTING ENTRY
  // =====================
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
        if (!entry) return navigate("/vault/mine");

        setTestimony(entry.testimony);
        setEntityId(entry.entity_id);
        setIsPublic(entry.is_public);
        setEvidenceList(evidenceRes.data || []);
      })
      .catch(() => navigate("/vault/mine"));
  }, [vaultEntryId, navigate]);

  // =====================
  // ENTITY SEARCH
  // =====================
  useEffect(() => {
    if (entitySearch.length < 2) {
      setEntityResults([]);
      return;
    }

    api.get(`/entities/search?q=${entitySearch}`)
      .then(res => setEntityResults(res.data))
      .catch(() => setEntityResults([]));
  }, [entitySearch]);

  // =====================
  // SAVE RECORD
  // =====================
  const saveRecord = async () => {
    if (!entityId || !testimony.trim()) {
      alert("Entity and testimony are required.");
      return;
    }

    setSaving(true);
    try {
      if (isNewEntry) {
        const res = await api.post("/vault-entries", {
          entity_id: entityId,
          testimony,
          is_public: isPublic
        });

        setVaultEntryId(res.data.id);
        navigate("/vault/upload", {
          state: { vault_entry_id: res.data.id },
          replace: true
        });
      } else {
        await api.patch(`/vault-entries/${vaultEntryId}`, {
          entity_id: entityId,
          testimony,
          is_public: isPublic
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================
  // UPLOAD EVIDENCE
  // =====================
  const addEvidence = async () => {
    if (!file || !vaultEntryId) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("description", evidenceNote);
      fd.append("vault_entry_id", vaultEntryId);

      await api.post("/vault", fd);

      setFile(null);
      setEvidenceNote("");

      const res = await api.get(
        `/vault-entries/${vaultEntryId}/evidence`
      );
      setEvidenceList(res.data || []);
    } finally {
      setUploading(false);
    }
  };

  // =====================
  // EVIDENCE PREVIEW RENDERER
  // =====================
  const renderPreview = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();

    if (lower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return (
        <img
          src={url}
          alt="Evidence"
          className="h-28 w-auto rounded-lg border"
        />
      );
    }

    if (lower.match(/\.(mp4|webm)$/)) {
      return (
        <video
          src={url}
          controls
          className="h-28 rounded-lg border"
        />
      );
    }

    if (lower.match(/\.(mp3|wav|ogg)$/)) {
      return (
        <audio
          src={url}
          controls
          className="w-full"
        />
      );
    }

    if (lower.match(/\.pdf$/)) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 text-sm underline"
        >
          📄 View PDF
        </a>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-600 text-sm underline"
      >
        Download file
      </a>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ENTITY */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-2">
            This record is about
          </h2>
          <input
            value={entitySearch}
            onChange={e => setEntitySearch(e.target.value)}
            placeholder="Search official, agency, or institution…"
            className="w-full p-3 rounded-xl border"
          />
          {entityResults.length > 0 && (
            <div className="border rounded-xl mt-2 bg-white shadow">
              {entityResults.map(ent => (
                <div
                  key={ent.id}
                  onClick={() => {
                    setEntityId(ent.id);
                    setEntitySearch(ent.name);
                    setEntityResults([]);
                  }}
                  className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                >
                  {ent.name} · {ent.state}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECORD */}
        <div className="rounded-2xl border bg-white p-6 space-y-6">

          <textarea
            rows={7}
            value={testimony}
            onChange={e => setTestimony(e.target.value)}
            placeholder="Write what happened. This is the core record."
            className="w-full p-4 rounded-xl border text-sm"
          />

          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} />
              Private
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} />
              Public
            </label>
          </div>

          <button
            onClick={saveRecord}
            disabled={saving}
            className="text-indigo-600 font-semibold text-sm"
          >
            {saving ? "Saving…" : isNewEntry ? "Create Record" : "Save Changes"}
          </button>

          {/* EVIDENCE */}
          {vaultEntryId && (
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-sm">Supporting Evidence</h3>

              <input type="file" onChange={e => setFile(e.target.files[0])} />

              <textarea
                rows={2}
                value={evidenceNote}
                onChange={e => setEvidenceNote(e.target.value)}
                placeholder="Why this evidence matters"
                className="w-full p-3 rounded-lg border text-sm"
              />

              <button
                onClick={addEvidence}
                disabled={uploading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {uploading ? "Uploading…" : "Attach Evidence"}
              </button>

              {/* PREVIEW LINE */}
              {evidenceList.length > 0 && (
                <div className="space-y-3 pt-2">
                  {evidenceList.map(ev => (
                    <div
                      key={ev.id}
                      className="flex gap-4 items-start border rounded-lg p-3"
                    >
                      {renderPreview(ev.blob_url)}
                      <div className="text-sm">
                        <p className="font-medium">
                          {ev.description || "Evidence"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
