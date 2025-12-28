import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultUpload() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const initialEntryId = locationState?.vault_entry_id || null;
  const [vaultEntryId, setVaultEntryId] = useState(initialEntryId);
  const isNewEntry = !vaultEntryId;

  const evidenceRef = useRef(null);

  /* =====================
     CORE STATE
     ===================== */
  const [testimony, setTestimony] = useState("");
  const [entityId, setEntityId] = useState(null);
  const [entityLabel, setEntityLabel] = useState("");
  const [entitySearch, setEntitySearch] = useState("");
  const [entityResults, setEntityResults] = useState([]);
  const [allEntities, setAllEntities] = useState([]);

  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState("");

  /* =====================
     EVIDENCE STATE
     ===================== */
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidenceList, setEvidenceList] = useState([]);
  const [uploading, setUploading] = useState(false);

  /* =====================
     LOAD ENTITIES
     ===================== */
  useEffect(() => {
    api.get("/ratings/entities").then((res) => {
      setAllEntities(res.data || []);
    });
  }, []);

  /* =====================
     ENTITY SEARCH
     ===================== */
  useEffect(() => {
    if (entitySearch.length < 2) {
      setEntityResults([]);
      return;
    }
    const q = entitySearch.toLowerCase();
    setEntityResults(
      (allEntities || [])
        .filter((e) => (e?.name || "").toLowerCase().includes(q))
        .slice(0, 6)
    );
  }, [entitySearch, allEntities]);

  /* =====================
     LOAD EXISTING ENTRY
     ===================== */
  useEffect(() => {
    if (!vaultEntryId) return;

    Promise.all([
      api.get("/vault-entries/mine"),
      api.get(`/vault-entries/${vaultEntryId}/evidence`),
    ]).then(([entriesRes, evidenceRes]) => {
      const entry = (entriesRes.data || []).find(
        (e) => e.id === Number(vaultEntryId)
      );
      if (!entry) return navigate("/vault/mine");

      setTestimony(entry.testimony || "");
      setEntityId(entry.entity_id || null);
      setIsPublic(!!entry.is_public);

      const ent = (allEntities || []).find((e) => e.id === entry.entity_id);
      if (ent) {
        setEntityLabel(ent.name);
        setEntitySearch(ent.name);
      }

      setEvidenceList(evidenceRes.data || []);
    });
  }, [vaultEntryId, allEntities, navigate]);

  /* =====================
     SAVE RECORD (NO AUTO-NAV)
     ===================== */
  const saveRecord = async () => {
    if (!entityId || !testimony.trim()) {
      alert("Select an entity and describe what happened.");
      return;
    }

    setSaving(true);
    setSavedBanner("");

    try {
      let entryId = vaultEntryId;

      if (isNewEntry) {
        const res = await api.post("/vault-entries", {
          entity_id: entityId,
          testimony,
          is_public: isPublic,
        });

        entryId = res.data.id;
        setVaultEntryId(entryId);

        // ✅ Stay on page so they can upload evidence
        setSavedBanner("Record created. You can upload evidence below now.");

        // Scroll to evidence section
        setTimeout(() => {
          evidenceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      } else {
        await api.patch(`/vault-entries/${vaultEntryId}`, {
          entity_id: entityId,
          testimony,
          is_public: isPublic,
        });

        setSavedBanner("Changes saved.");
      }
    } catch (err) {
      console.error("Failed to save vault record", err);
      alert("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* =====================
     FILE PICKER
     ===================== */
  const handleFilePick = (e) => {
    setSelectedFiles(Array.from(e.target.files || []));
  };

  /* =====================
     UPLOAD EVIDENCE
     ===================== */
  const uploadEvidence = async () => {
    if (!vaultEntryId) {
      alert("Create the record first, then upload evidence.");
      return;
    }
    if (selectedFiles.length === 0) {
      alert("Pick at least one file first.");
      return;
    }

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("description", evidenceNote);
        fd.append("vault_entry_id", vaultEntryId);

        await api.post("/vault", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSelectedFiles([]);
      setEvidenceNote("");

      const res = await api.get(`/vault-entries/${vaultEntryId}/evidence`);
      setEvidenceList(res.data || []);
      setSavedBanner("Evidence uploaded.");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Check your server logs and try again.");
    } finally {
      setUploading(false);
    }
  };

  const renderPreview = (url) => {
    if (!url) return null;
    const l = url.toLowerCase();

    if (/\.(jpg|jpeg|png|webp|gif)$/.test(l)) {
      return <img src={url} className="h-24 w-24 object-cover rounded-lg" alt="evidence" />;
    }
    if (/\.(mp4|webm)$/.test(l)) {
      return <video src={url} controls className="h-24 rounded-lg" />;
    }
    if (/\.(mp3|wav|ogg)$/.test(l)) {
      return <audio src={url} controls />;
    }
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm">
        Open file
      </a>
    );
  };

  const doneRoute = isPublic ? "/vault/public" : "/vault/mine";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* ENTITY */}
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-slate-600">This record is about</h2>

          <input
            value={entitySearch}
            onChange={(e) => setEntitySearch(e.target.value)}
            placeholder="Search an official or agency"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />

          {entityResults.length > 0 && (
            <div className="mt-2 rounded-xl border bg-white shadow">
              {entityResults.map((ent) => (
                <button
                  key={ent.id}
                  onClick={() => {
                    setEntityId(ent.id);
                    setEntityLabel(ent.name);
                    setEntitySearch(ent.name);
                    setEntityResults([]);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
                >
                  {ent.name} · {ent.state}
                </button>
              ))}
            </div>
          )}

          {entityId && <p className="text-xs text-slate-500">Selected: {entityLabel}</p>}
        </div>

        {/* SAVED BANNER */}
        {savedBanner && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {savedBanner}
          </div>
        )}

        {/* RECORD CARD */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 space-y-5">
          <textarea
            rows={6}
            value={testimony}
            onChange={(e) => setTestimony(e.target.value)}
            placeholder="What happened? Write clearly and factually."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
          />

          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} />
                Private
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} />
                Public
              </label>
            </div>

            <div className="flex items-center gap-3">
              {!isNewEntry && (
                <button
                  onClick={() => navigate(doneRoute)}
                  className="text-slate-600 font-semibold hover:underline"
                >
                  Done
                </button>
              )}

              <button onClick={saveRecord} disabled={saving} className="text-indigo-600 font-semibold">
                {saving ? "Saving…" : isNewEntry ? "Create" : "Save"}
              </button>
            </div>
          </div>

          {/* EVIDENCE */}
          <div ref={evidenceRef} className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-semibold">Evidence</h3>

            {!vaultEntryId && (
              <p className="text-xs text-slate-500">Create the record first to add evidence.</p>
            )}

            {vaultEntryId && (
              <>
                <label className="block cursor-pointer">
                  <input type="file" multiple onChange={handleFilePick} className="hidden" />
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    Tap to select photos, videos, or files
                  </div>
                </label>

                {selectedFiles.length > 0 && (
                  <div className="space-y-1 text-xs">
                    {selectedFiles.map((f, i) => (
                      <p key={i}>{f.name}</p>
                    ))}
                  </div>
                )}

                <textarea
                  rows={2}
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  placeholder="Why does this evidence matter?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                />

                <button
                  onClick={uploadEvidence}
                  disabled={uploading}
                  className="w-full rounded-xl bg-indigo-600 text-white py-3 font-semibold disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Upload Evidence"}
                </button>

                {evidenceList.length > 0 && (
                  <div className="space-y-3">
                    {evidenceList.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex gap-3 items-start rounded-xl border border-slate-200 p-3"
                      >
                        {renderPreview(ev.blob_url)}
                        <p className="text-sm">{ev.description || "Evidence"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* DONE BUTTON (NEW ENTRY) */}
          {vaultEntryId && isNewEntry && (
            <button
              onClick={() => navigate(doneRoute)}
              className="w-full rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
