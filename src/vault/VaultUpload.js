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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);

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
      setIsAnonymous(!!entry.is_anonymous);

      const ent = (allEntities || []).find((e) => e.id === entry.entity_id);
      if (ent) {
        setEntityLabel(ent.name);
        setEntitySearch(ent.name);
      }

      setEvidenceList(evidenceRes.data || []);
    });
  }, [vaultEntryId, allEntities, navigate]);

  /* =====================
     SAVE RECORD
     ===================== */
  const saveRecord = async () => {
    if (!entityId || !testimony.trim()) {
      alert("Select an entity and describe what happened.");
      return;
    }

    setSaving(true);

    try {
      let entryId = vaultEntryId;

      if (isNewEntry) {
        const res = await api.post("/vault-entries", {
          entity_id: entityId,
          testimony,
          is_public: isPublic,
          is_anonymous: isAnonymous,
        });

        entryId = res.data.id;
        setVaultEntryId(entryId);

        const hasEvidence = window.confirm(
          "Do you have evidence you want to upload now?"
        );

        if (hasEvidence) {
          setTimeout(() => {
            evidenceRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 50);
        } else {
          navigate(isPublic ? "/vault/public" : "/vault/mine");
        }
      } else {
        await api.patch(`/vault-entries/${vaultEntryId}`, {
          entity_id: entityId,
          testimony,
          is_public: isPublic,
          is_anonymous: isAnonymous,
        });

        navigate(isPublic ? "/vault/public" : "/vault/mine");
      }
    } catch (err) {
      console.error("Failed to save vault record", err);
      alert("Something went wrong while saving.");
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
     PREVIEW RENDER
     ===================== */
  const renderPreview = (file) => {
    const url = URL.createObjectURL(file);
    const name = file.name.toLowerCase();

    if (/\.(jpg|jpeg|png|webp|gif)$/.test(name)) {
      return <img src={url} className="h-24 w-full object-cover rounded-lg" />;
    }
    if (/\.(mp4|webm)$/.test(name)) {
      return <video src={url} className="h-24 rounded-lg" controls />;
    }
    if (/\.(mp3|wav|ogg)$/.test(name)) {
      return <audio src={url} controls />;
    }

    return (
      <div className="text-sm underline break-all">
        {file.name}
      </div>
    );
  };

  /* =====================
     UPLOAD EVIDENCE
     ===================== */
  const uploadEvidence = async () => {
    if (!vaultEntryId || selectedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("description", evidenceNote);
        fd.append("vault_entry_id", vaultEntryId);
        fd.append("is_anonymous", String(isAnonymous)); // ✅ FIX

        await api.post("/vault", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate(isPublic ? "/vault/public" : "/vault/mine");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Evidence upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ENTITY */}
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-slate-600">
            This record is about
          </h2>

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

          {entityId && (
            <p className="text-xs text-slate-500">
              Selected: {entityLabel}
            </p>
          )}
        </div>

        {/* RECORD */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 space-y-5">
          <textarea
            rows={6}
            value={testimony}
            onChange={(e) => setTestimony(e.target.value)}
            placeholder="What happened? Write clearly and factually."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
          />

          <div className="flex flex-wrap gap-4 text-sm">
            <label>
              <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} /> Private
            </label>
            <label>
              <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} /> Public
            </label>
            <label>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              /> Post anonymously
            </label>
          </div>

          <button
            onClick={saveRecord}
            disabled={saving}
            className="text-indigo-600 font-semibold"
          >
            {saving ? "Saving…" : isNewEntry ? "Create" : "Save"}
          </button>

          {/* EVIDENCE */}
          <div ref={evidenceRef} className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-semibold">Evidence</h3>

            <input type="file" multiple onChange={handleFilePick} />

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="border rounded-xl p-2">
                    {renderPreview(f)}
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length > 0 && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
