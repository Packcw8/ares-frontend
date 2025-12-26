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
  const [entityLabel, setEntityLabel] = useState("");
  const [entitySearch, setEntitySearch] = useState("");
  const [entityResults, setEntityResults] = useState([]);
  const [allEntities, setAllEntities] = useState([]);

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
  // LOAD ENTITIES (ONCE)
  // =====================
  useEffect(() => {
    api
      .get("/ratings/entities")
      .then(res => setAllEntities(res.data || []))
      .catch(err => {
        console.error("Failed to load entities", err);
        setAllEntities([]);
      });
  }, []);

  // =====================
  // ENTITY SEARCH (CLIENT SIDE)
  // =====================
  useEffect(() => {
    if (entitySearch.length < 2) {
      setEntityResults([]);
      return;
    }

    const q = entitySearch.toLowerCase();
    const filtered = allEntities.filter(e =>
      e.name.toLowerCase().includes(q)
    );

    setEntityResults(filtered.slice(0, 10));
  }, [entitySearch, allEntities]);

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

        const ent = allEntities.find(e => e.id === entry.entity_id);
        if (ent) setEntityLabel(ent.name);

        setEvidenceList(evidenceRes.data || []);
      })
      .catch(err => {
        console.error("Failed to load vault entry", err);
        navigate("/vault/mine");
      });
  }, [vaultEntryId, allEntities, navigate]);

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
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save record");
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
    } catch (err) {
      console.error("Evidence upload failed", err);
      alert("Evidence upload failed");
    } finally {
      setUploading(false);
    }
  };

  // =====================
  // EVIDENCE PREVIEW
  // =====================
  const renderPreview = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();

    if (/\.(jpg|jpeg|png|gif|webp)$/.test(lower)) {
      return <img src={url} className="h-24 rounded border" />;
    }
    if (/\.(mp4|webm)$/.test(lower)) {
      return <video src={url} controls className="h-24 rounded border" />;
    }
    if (/\.(mp3|wav|ogg)$/.test(lower)) {
      return <audio src={url} controls className="w-full" />;
    }
    if (/\.pdf$/.test(lower)) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600">
          View PDF
        </a>
      );
    }
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600">
        Download file
      </a>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* ENTITY */}
        <div>
          <h2 className="text-sm font-semibold mb-2">This record is about</h2>
          <input
            value={entitySearch}
            onChange={e => setEntitySearch(e.target.value)}
            placeholder="Search approved entity..."
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

          {entityId && (
            <p className="text-xs text-slate-500 mt-1">
              Selected: {entityLabel}
            </p>
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
              <input
                type="radio"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
              />
              Private
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
              />
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
          <div className="pt-4 border-t space-y-4">
            <h3 className="font-semibold text-sm">Supporting Evidence</h3>

            {!vaultEntryId && (
              <p className="text-xs text-slate-500">
                Create the record first to attach evidence.
              </p>
            )}

            {vaultEntryId && (
              <>
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

                {evidenceList.length > 0 && (
                  <div className="space-y-3">
                    {evidenceList.map(ev => (
                      <div
                        key={ev.id}
                        className="flex gap-4 items-start border rounded-lg p-3"
                      >
                        {renderPreview(ev.blob_url)}
                        <p className="text-sm font-medium">
                          {ev.description || "Evidence"}
                        </p>
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
