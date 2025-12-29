import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { timeAgo, fullDate } from "../utils/time";

export default function MyVault() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* =========================
     LOAD ENTITIES (for names)
     ========================= */
  useEffect(() => {
    api.get("/ratings/entities").then((res) => {
      setEntities(res.data || []);
    });
  }, []);

  const entityName = (id) =>
    entities.find((e) => e.id === id)?.name || "Unknown entity";

  /* =========================
     LOAD VAULT + EVIDENCE
     ========================= */
  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vault-entries/mine");
      const baseEntries = res.data || [];

      const hydrated = await Promise.all(
        baseEntries.map(async (entry) => {
          const evRes = await api.get(
            `/vault-entries/${entry.id}/evidence`
          );
          return {
            ...entry,
            evidence: evRes.data || [],
          };
        })
      );

      setEntries(hydrated);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  /* =========================
     TOGGLE VISIBILITY
     ========================= */
  const toggleVisibility = async (entry) => {
    const makePublic = !entry.is_public;
    setUpdatingId(entry.id);

    try {
      await api.patch(
        `/vault-entries/${entry.id}/visibility`,
        null,
        { params: { make_public: makePublic } }
      );

      await loadEntries();
    } catch {
      alert("Failed to update visibility.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     RENDER EVIDENCE
     ========================= */
  const renderEvidence = (ev) => {
    const url = ev.blob_url?.toLowerCase() || "";

    if (/\.(jpg|jpeg|png|webp|gif)$/.test(url)) {
      return (
        <img
          src={ev.blob_url}
          className="h-24 w-24 object-cover rounded-lg"
          alt="evidence"
        />
      );
    }

    if (/\.(mp4|webm)$/.test(url)) {
      return (
        <video
          src={ev.blob_url}
          controls
          className="h-24 rounded-lg"
        />
      );
    }

    return (
      <a
        href={ev.blob_url}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-600 text-sm underline"
      >
        Open file
      </a>
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            My Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your private and public evidence archive
          </p>
        </div>

        {/* INFO BAR */}
        <div className="mb-8 rounded-2xl border border-slate-300 bg-slate-50 p-5 text-sm text-slate-700 space-y-2">
          <p className="font-semibold text-slate-900">
            What is My Vault?
          </p>

          <p>
            My Vault is your personal workspace for writing testimony and
            attaching supporting materials such as images, video, audio, or
            documents.
          </p>

          <p>
            Entries you create here are <strong>private by default</strong>.
            You decide if and when an entry becomes public and appears in the
            Community Records feed.
          </p>

          <p>
            Publishing an entry does not make claims or conclusions. It simply
            makes the record visible alongside other public-facing materials
            connected to an entity.
          </p>

          <p className="text-slate-600">
            You can continue adding evidence to an entry at any time, whether
            it is private or public.
          </p>
        </div>

        {loading && (
          <p className="text-slate-500">Loading your vault…</p>
        )}

        {!loading && entries.length === 0 && (
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-slate-800">
              No vault entries yet
            </h3>
          </div>
        )}

        <div className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* HEADER */}
              <div className="px-6 py-4 border-b flex justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-700">
                    {entityName(entry.entity_id)}
                  </span>

                  <p
                    className="text-xs text-slate-400 mt-1"
                    title={fullDate(entry.created_at)}
                  >
                    Created {timeAgo(entry.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => toggleVisibility(entry)}
                  disabled={updatingId === entry.id}
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  {entry.is_public ? "Make Private" : "Publish"}
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-4">
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {entry.testimony}
                </p>

                {/* EVIDENCE */}
                {entry.evidence?.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {entry.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex gap-3 items-start border rounded-xl p-3"
                      >
                        {renderEvidence(ev)}
                        <p className="text-xs text-slate-600">
                          {ev.description || "Evidence"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="px-6 py-4 flex justify-between items-center border-t bg-slate-50">
                <button
                  onClick={() =>
                    navigate("/vault/upload", {
                      state: { vault_entry_id: entry.id },
                    })
                  }
                  className="text-sm font-semibold text-slate-700 hover:text-indigo-600"
                >
                  + Add Evidence
                </button>

                <span className="text-xs text-slate-400">
                  {entry.evidence?.length || 0} files
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
