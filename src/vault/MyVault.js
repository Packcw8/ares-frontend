import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { timeAgo, fullDate } from "../utils/time";

export default function MyVault() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* =========================
     LOAD MY VAULT ENTRIES
     ========================= */
  const loadEntries = () => {
    setLoading(true);
    api
      .get("/vault-entries/mine")
      .then((res) => setEntries(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
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

      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? {
                ...e,
                is_public: makePublic,
                published_at: makePublic
                  ? new Date().toISOString()
                  : null,
              }
            : e
        )
      );
    } catch {
      alert("Failed to update visibility.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     ADD EVIDENCE
     ========================= */
  const addEvidence = (entryId) => {
    navigate("/vault/upload", {
      state: { vault_entry_id: entryId },
    });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            My Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Private documentation and published records you control
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-slate-500">
            Loading your vault…
          </p>
        )}

        {/* EMPTY STATE */}
        {!loading && entries.length === 0 && (
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-slate-800">
              Your vault is empty
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Start by documenting an incident privately or publicly.
            </p>

            <button
              onClick={() => navigate("/vault/new")}
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-indigo-600
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow
                hover:bg-indigo-700
              "
            >
              + Create Vault Entry
            </button>
          </div>
        )}

        {/* ENTRY LIST */}
        <div className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between px-6 py-4 border-b">
                <div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      entry.is_public
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {entry.is_public ? "Public" : "Private"}
                  </span>

                  <p
                    className="mt-2 text-xs text-slate-400"
                    title={fullDate(entry.created_at)}
                  >
                    Created {timeAgo(entry.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => toggleVisibility(entry)}
                  disabled={updatingId === entry.id}
                  className="
                    text-sm
                    font-medium
                    text-indigo-600
                    hover:underline
                    disabled:opacity-50
                  "
                >
                  {entry.is_public ? "Make Private" : "Publish"}
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-4">
                <p className="text-sm text-slate-800 leading-relaxed line-clamp-5">
                  {entry.testimony}
                </p>
              </div>

              {/* FOOTER */}
              <div className="px-6 py-4 flex justify-between items-center border-t bg-slate-50">
                <button
                  onClick={() => addEvidence(entry.id)}
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                    hover:text-indigo-600
                  "
                >
                  + Add Evidence
                </button>

                <button
                  onClick={() =>
                    navigate(`/vault/entry/${entry.id}`)
                  }
                  className="
                    text-sm
                    font-semibold
                    text-indigo-600
                    hover:underline
                  "
                >
                  View Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
