import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultUpload() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const initialEntryId = locationState?.vault_entry_id || null;
  const [vaultEntryId, setVaultEntryId] = useState(initialEntryId);

  const evidenceRef = useRef(null);

  const [testimony, setTestimony] = useState("");
  const [entityId, setEntityId] = useState(null);
  const [entitySearch, setEntitySearch] = useState("");
  const [entityResults, setEntityResults] = useState([]);
  const [allEntities, setAllEntities] = useState([]);

  const [isPublic, setIsPublic] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/ratings/entities").then(res => {
      setAllEntities(res.data || []);
    });
  }, []);

  useEffect(() => {
    if (entitySearch.length < 2) {
      setEntityResults([]);
      return;
    }
    const q = entitySearch.toLowerCase();
    setEntityResults(
      (allEntities || [])
        .filter(e => (e?.name || "").toLowerCase().includes(q))
        .slice(0, 6)
    );
  }, [entitySearch, allEntities]);

  const saveRecord = async () => {
    if (!entityId || !testimony.trim()) {
      alert("Select an entity and write your testimony first.");
      return;
    }

    setSaving(true);

    try {
      const res = await api.post("/vault-entries", {
        entity_id: entityId,
        testimony,
        is_public: isPublic,
        is_anonymous: isAnonymous
      });

      const entryId = res.data.id;
      setVaultEntryId(entryId);

      const wantsEvidence = window.confirm(
        "Your testimony was saved. Do you want to add evidence now?"
      );

      if (wantsEvidence) {
        setTimeout(() => {
          evidenceRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        navigate(isPublic ? "/vault/public" : "/vault/mine");
      }
    } catch {
      alert("Failed to save testimony.");
    } finally {
      setSaving(false);
    }
  };

  const handleFilePick = (e) => {
    setSelectedFiles(Array.from(e.target.files || []));
  };

  const renderPreview = (file) => {
    const url = URL.createObjectURL(file);
    const name = file.name.toLowerCase();

    if (/(jpg|jpeg|png|gif|webp)$/.test(name)) {
      return <img src={url} className="h-32 w-full object-cover rounded-lg" />;
    }
    if (/(mp4|webm)$/.test(name)) {
      return <video src={url} controls className="h-32 rounded-lg" />;
    }
    if (/(mp3|wav|ogg)$/.test(name)) {
      return <audio src={url} controls />;
    }

    return <div className="text-xs break-all underline">{file.name}</div>;
  };

  const uploadEvidence = async () => {
    if (!vaultEntryId || selectedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("description", evidenceNote);
        fd.append("vault_entry_id", vaultEntryId);
        fd.append("is_anonymous", String(isAnonymous));

        await api.post("/vault", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      navigate(isPublic ? "/vault/public" : "/vault/mine");
    } catch {
      alert("Evidence upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* INFO BAR */}
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 text-sm text-slate-700 space-y-3">
          <p className="font-semibold text-slate-900">
            How records work
          </p>

          <p>
            Every record created here must be attached to a{" "}
            <strong>public-facing entity</strong> such as an official, agency,
            court, institution, or program. This keeps records organized,
            searchable, and contextual.
          </p>

          <p>
            If you cannot find the entity you are looking for, you can add a new
            one. New entities are reviewed before becoming publicly visible.
          </p>

          <button
            onClick={() => navigate("/ratings/new")}
            className="
              inline-flex items-center
              rounded-lg
              border border-slate-300
              bg-white
              px-4 py-2
              text-sm font-medium
              text-slate-700
              hover:bg-slate-100
              transition
            "
          >
            Add a public entity →
          </button>

          <p className="text-slate-600">
            Records are private by default. You control whether they are made
            public, and you may add evidence now or later.
          </p>
        </div>

        {/* ENTITY SEARCH */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-slate-600">
            This record is about
          </h2>

          <input
            value={entitySearch}
            onChange={(e) => setEntitySearch(e.target.value)}
            placeholder="Search an official, agency, or institution"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />

          {entityResults.length > 0 && (
            <div className="rounded-xl border bg-white shadow">
              {entityResults.map(ent => (
                <button
                  key={ent.id}
                  onClick={() => {
                    setEntityId(ent.id);
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
        </div>

        {/* TESTIMONY + EVIDENCE */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 space-y-5">
          <textarea
            rows={6}
            value={testimony}
            onChange={(e) => setTestimony(e.target.value)}
            placeholder="Describe what happened clearly and factually."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
          />

          <div className="flex flex-wrap gap-4 text-sm">
            <label>
              <input
                type="radio"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
              />{" "}
              Private
            </label>

            <label>
              <input
                type="radio"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
              />{" "}
              Public
            </label>

            <label>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
              />{" "}
              Anonymous
            </label>
          </div>

          <button
            onClick={saveRecord}
            disabled={saving}
            className="text-indigo-600 font-semibold"
          >
            {saving ? "Saving…" : "Save Testimony"}
          </button>

          <div ref={evidenceRef} className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-semibold">
              Add Evidence (optional)
            </h3>

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
                  placeholder="Explain why this evidence matters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                />

                <button
                  onClick={uploadEvidence}
                  disabled={uploading}
                  className="w-full rounded-xl bg-indigo-600 text-white py-3 font-semibold disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Upload Evidence & Finish"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
