import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultPublic() {
  const navigate = useNavigate();

  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");

  // Evidence modal
  const [activeEvidence, setActiveEvidence] = useState(null);

  useEffect(() => {
    api
      .get("/feed")
      .then(res => setFeed(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     AUTOCOMPLETE DATA
     ========================= */
  const states = useMemo(() => {
    return [...new Set(feed.map(f => f.entity?.state).filter(Boolean))].sort();
  }, [feed]);

  const counties = useMemo(() => {
    return [...new Set(
      feed
        .filter(f => !stateFilter || f.entity?.state === stateFilter)
        .map(f => f.entity?.county)
        .filter(Boolean)
    )].sort();
  }, [feed, stateFilter]);

  /* =========================
     APPLY FILTERS
     ========================= */
  const filteredFeed = useMemo(() => {
    return feed.filter(item => {
      const entity = item.entity || {};

      if (stateFilter && entity.state !== stateFilter) return false;
      if (countyFilter && entity.county !== countyFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const name = entity.name?.toLowerCase() || "";
        const text = (item.testimony || item.description || "").toLowerCase();
        if (!name.includes(q) && !text.includes(q)) return false;
      }

      return true;
    });
  }, [feed, stateFilter, countyFilter, search]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        <h1 className="text-xl font-bold text-slate-900">
          Public Records
        </h1>

        {/* FILTER BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entity or text…"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />

          {/* STATE AUTOCOMPLETE */}
          <div className="relative">
            <input
              value={stateFilter}
              onChange={e => {
                setStateFilter(e.target.value);
                setCountyFilter("");
              }}
              placeholder="State"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
            {stateFilter && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow">
                {states
                  .filter(s => s.toLowerCase().startsWith(stateFilter.toLowerCase()))
                  .slice(0, 8)
                  .map(s => (
                    <button
                      key={s}
                      onClick={() => setStateFilter(s)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      {s}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* COUNTY AUTOCOMPLETE */}
          <div className="relative">
            <input
              value={countyFilter}
              onChange={e => setCountyFilter(e.target.value)}
              placeholder="County"
              disabled={!stateFilter}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm disabled:opacity-60"
            />
            {countyFilter && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow">
                {counties
                  .filter(c => c.toLowerCase().startsWith(countyFilter.toLowerCase()))
                  .slice(0, 8)
                  .map(c => (
                    <button
                      key={c}
                      onClick={() => setCountyFilter(c)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      {c}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Loading activity…</p>
        )}

        {!loading && filteredFeed.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12">
            No public records match your filters.
          </p>
        )}

        <div className="space-y-6">
          {filteredFeed.map(item => (
            <PublicVaultCard
              key={item.id}
              item={item}
              navigate={navigate}
              onOpenEvidence={setActiveEvidence}
            />
          ))}
        </div>
      </div>

      {/* EVIDENCE MODAL */}
      {activeEvidence && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-4 relative">
            <button
              onClick={() => setActiveEvidence(null)}
              className="absolute top-3 right-3 text-slate-500 hover:text-black"
            >
              ✕
            </button>
            {renderEvidence(activeEvidence, true)}
            {activeEvidence.description && (
              <p className="mt-3 text-sm text-slate-600">
                {activeEvidence.description}
              </p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

/* ======================================================
   PUBLIC VAULT CARD
   ====================================================== */
function PublicVaultCard({ item, navigate, onOpenEvidence }) {
  const entity = item.entity;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="flex items-start gap-3 px-6 py-4 border-b bg-slate-50">
        <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
          {entity?.name?.[0] || "?"}
        </div>

        <div className="flex-1">
          {entity && (
            <button
              onClick={() => navigate(`/ratings/${entity.id}`)}
              className="text-sm font-semibold text-slate-900 hover:underline"
            >
              {entity.name}
            </button>
          )}

          <p className="text-xs text-slate-500">
            {entity?.county && `${entity.county}, `}{entity?.state}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="px-6 py-4 space-y-4">
        <p className="text-sm text-slate-800 whitespace-pre-line">
          {item.testimony || item.description}
        </p>

        {item.evidence?.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {item.evidence.map(ev => (
              <button
                key={ev.id}
                onClick={() => onOpenEvidence(ev)}
                className="border rounded-xl p-2 hover:ring-2 ring-indigo-500"
              >
                {renderEvidence(ev)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-6 py-3 border-t bg-slate-50 text-xs text-slate-500">
        Posted publicly
      </div>
    </div>
  );
}

/* ======================================================
   EVIDENCE RENDER
   ====================================================== */
function renderEvidence(ev, large = false) {
  const url = ev.blob_url?.toLowerCase() || "";
  const size = large ? "max-h-[70vh]" : "h-32";

  if (/\.(jpg|jpeg|png|webp|gif)$/.test(url)) {
    return <img src={ev.blob_url} className={`${size} w-full object-contain rounded-lg`} />;
  }

  if (/\.(mp4|webm)$/.test(url)) {
    return <video src={ev.blob_url} controls className={`${size} w-full rounded-lg`} />;
  }

  if (/\.(mp3|wav|ogg)$/.test(url)) {
    return <audio src={ev.blob_url} controls className="w-full" />;
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
}
