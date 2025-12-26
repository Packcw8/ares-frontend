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
  // CORE STATE
  // =====================
  const [testimony, setTestimony] = useState("");
  const [entityId, setEntityId] = useState("");
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
      .then(([entryRes, evidenceRes]) => {
        const entry = entryRes.data.find(e => e.id === Number(vaultEntryId));
        if (!entry) throw new Error("Not found");

        setTestimony(entry.testimony || "");
        setEntityId(entry.entity_id || "");
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
  // SAVE ENTRY
  // =====================
  const saveEntry = async () => {
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
  const uploadEvidence = async () => {
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

      const res = await api.get(`/vault-entries/${vaultEntryId}/evidence`);
      setEvidenceList(res.data || []);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ENTITY */}
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold mb-2">Who is this about?</h2>
          <input
            value={entitySearch}
            onChange={e => setEntitySearch(e.target.value)}
            placeholder="Search official, agency, or institution…"
            className="w-full p-3 rounded-lg border"
          />
          {entityResults.length > 0 && (
            <div className="border rounded-lg mt-2 bg-white shadow">
              {entityResults.map(ent => (
                <div
                  key={ent.id}
                  onClick={() => {
                    setEntityId(ent.id);
                    setEntitySearch(ent.name);
                    setEntityResults([]);
                  }}
                  className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                >
                  {ent.name} · {ent.state}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TESTIMONY */}
        <div className="rounded-2xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">What happened?</h2>
          <textarea
            rows={7}
            value={testimony}
            onChange={e => setTestimony(e.target.value)}
            placeholder="Write your account in your own words…"
            className="w-full p-4 rounded-xl border"
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
            onClick={saveEntry}
            disabled={saving}
            className="text-indigo-600 font-semibold"
          >
            {saving ? "Saving…" : "Save Record"}
          </button>
        </div>

        {/* EVIDENCE */}
        {vaultEntryId && (
          <div className="rounded-2xl border bg-white p-5 space-y-4">
            <h2 className="font-semibold">Attach Evidence</h2>

            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <textarea
              rows={2}
              value={evidenceNote}
              onChange={e => setEvidenceNote(e.target.value)}
              placeholder="Why this evidence matters…"
              className="w-full p-3 rounded-lg border"
            />

            <button
              onClick={uploadEvidence}
              disabled={uploading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              {uploading ? "Uploading…" : "Attach Evidence"}
            </button>

            {evidenceList.length > 0 && (
              <div className="space-y-3">
                {evidenceList.map(ev => (
                  <div key={ev.id} className="border rounded-lg p-3 text-sm">
                    <p className="font-medium">{ev.description || "Evidence"}</p>
                    <a href={ev.blob_url} target="_blank" rel="noreferrer" className="text-indigo-600">
                      View file
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
