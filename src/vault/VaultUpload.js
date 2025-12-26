import { useState, useEffect, useCallback } from "react";
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
  const [entityLabel, setEntityLabel] = useState("");
  const [entitySearch, setEntitySearch] = useState("");
  const [entityResults, setEntityResults] = useState([]);
  const [allEntities, setAllEntities] = useState([]);

  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  // =====================
  // EVIDENCE
  // =====================
  const [files, setFiles] = useState([]);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidenceList, setEvidenceList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // =====================
  // LOAD ENTITIES
  // =====================
  useEffect(() => {
    api.get("/ratings/entities").then(res => {
      setAllEntities(res.data || []);
    });
  }, []);

  // =====================
  // ENTITY SEARCH
  // =====================
  useEffect(() => {
    if (entitySearch.length < 2) {
      setEntityResults([]);
      return;
    }
    const q = entitySearch.toLowerCase();
    setEntityResults(
      allEntities.filter(e => e.name.toLowerCase().includes(q)).slice(0, 8)
    );
  }, [entitySearch, allEntities]);

  // =====================
  // LOAD ENTRY
  // =====================
  useEffect(() => {
    if (!vaultEntryId) return;
    Promise.all([
      api.get("/vault-entries/mine"),
      api.get(`/vault-entries/${vaultEntryId}/evidence`)
    ]).then(([entriesRes, evidenceRes]) => {
      const entry = entriesRes.data.find(e => e.id === Number(vaultEntryId));
      if (!entry) return navigate("/vault/mine");
      setTestimony(entry.testimony);
      setEntityId(entry.entity_id);
      setIsPublic(entry.is_public);
      const ent = allEntities.find(e => e.id === entry.entity_id);
      if (ent) setEntityLabel(ent.name);
      setEvidenceList(evidenceRes.data || []);
    });
  }, [vaultEntryId, allEntities, navigate]);

  // =====================
  // SAVE RECORD
  // =====================
  const saveRecord = async () => {
    if (!entityId || !testimony.trim()) return alert("Entity & testimony required");
    setSaving(true);
    try {
      if (isNewEntry) {
        const res = await api.post("/vault-entries", {
          entity_id: entityId,
          testimony,
          is_public: isPublic
        });
        setVaultEntryId(res.data.id);
        navigate("/vault/upload", { state: { vault_entry_id: res.data.id }, replace: true });
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
  // DRAG & DROP
  // =====================
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  // =====================
  // UPLOAD FILES
  // =====================
  const uploadEvidence = async () => {
    if (!vaultEntryId || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("description", evidenceNote);
        fd.append("vault_entry_id", vaultEntryId);

        await api.post("/vault", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      setFiles([]);
      setEvidenceNote("");
      const res = await api.get(`/vault-entries/${vaultEntryId}/evidence`);
      setEvidenceList(res.data || []);
    } finally {
      setUploading(false);
    }
  };

  const renderPreview = (url) => {
    if (!url) return null;
    const l = url.toLowerCase();
    if (/\.(jpg|png|jpeg|webp|gif)$/.test(l)) return <img src={url} className="h-24 rounded" />;
    if (/\.(mp4|webm)$/.test(l)) return <video src={url} controls className="h-24 rounded" />;
    if (/\.(mp3|wav|ogg)$/.test(l)) return <audio src={url} controls />;
    return <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600">Download</a>;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* ENTITY */}
        <div>
          <h2 className="text-xs font-semibold mb-1">This record is about</h2>
          <input
            value={entitySearch}
            onChange={e => setEntitySearch(e.target.value)}
            placeholder="Search entity…"
            className="w-full p-3 rounded-xl border"
          />
          {entityResults.length > 0 && (
            <div className="border rounded-xl mt-2 bg-white shadow">
              {entityResults.map(ent => (
                <div
                  key={ent.id}
                  onClick={() => {
                    setEntityId(ent.id);
                    setEntityLabel(ent.name);
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
          {entityId && <p className="text-xs text-slate-500">Selected: {entityLabel}</p>}
        </div>

        {/* RECORD */}
        <div className="rounded-2xl border bg-white p-6 space-y-6 shadow-sm">
          <textarea
            rows={6}
            value={testimony}
            onChange={e => setTestimony(e.target.value)}
            placeholder="Describe what happened…"
            className="w-full p-4 rounded-xl border"
          />

          <div className="flex gap-6 text-sm">
            <label><input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} /> Private</label>
            <label><input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} /> Public</label>
          </div>

          <button onClick={saveRecord} disabled={saving} className="text-indigo-600 font-semibold">
            {saving ? "Saving…" : isNewEntry ? "Create Record" : "Save Changes"}
          </button>

          {/* EVIDENCE */}
          <div className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-semibold">Evidence</h3>

            {!vaultEntryId && (
              <p className="text-xs text-slate-500">Create the record first to upload evidence.</p>
            )}

            {vaultEntryId && (
              <>
                <div
                  onDrop={onDrop}
                  onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-slate-500"
                >
                  Drag & drop files here or click to select
                  <input
                    type="file"
                    multiple
                    onChange={e => setFiles(Array.from(e.target.files))}
                    className="hidden"
                  />
                </div>

                {files.length > 0 && (
                  <ul className="text-xs">
                    {files.map((f, i) => <li key={i}>{f.name}</li>)}
                  </ul>
                )}

                <textarea
                  rows={2}
                  value={evidenceNote}
                  onChange={e => setEvidenceNote(e.target.value)}
                  placeholder="Why this evidence matters"
                  className="w-full p-3 rounded-lg border text-sm"
                />

                <button
                  onClick={uploadEvidence}
                  disabled={uploading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                >
                  {uploading ? "Uploading…" : "Upload Evidence"}
                </button>

                {evidenceList.length > 0 && (
                  <div className="space-y-3">
                    {evidenceList.map(ev => (
                      <div key={ev.id} className="flex gap-4 items-start border rounded-lg p-3">
                        {renderPreview(ev.blob_url)}
                        <p className="text-sm">{ev.description || "Evidence"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
