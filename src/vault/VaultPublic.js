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

  useEffect(() => {
    api
      .get("/feed")
      .then(res => setFeed(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     BUILD FILTER OPTIONS
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
          Community Records
        </h1>

        {/* FILTER BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entity or text…"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />

          <select
            value={stateFilter}
            onChange={e => {
              setStateFilter(e.target.value);
              setCountyFilter("");
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          >
            <option value="">All states</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={countyFilter}
            onChange={e => setCountyFilter(e.target.value)}
            disabled={!stateFilter}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm disabled:opacity-60"
          >
            <option value="">All counties</option>
            {counties.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

/* ======================================================
   PUBLIC VAULT CARD (MYVAULT PARITY)
   ====================================================== */
function PublicVaultCard({ item, navigate }) {
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
              <div
                key={ev.id}
                className="border rounded-xl p-3 flex flex-col gap-2"
              >
                {renderEvidence(ev)}
                {ev.description && (
                  <p className="text-xs text-slate-600">
                    {ev.description}
                  </p>
                )}
              </div>
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
   EVIDENCE RENDER (SAME AS MYVAULT)
   ====================================================== */
function renderEvidence(ev) {
  const url = ev.blob_url?.toLowerCase() || "";

  if (/\.(jpg|jpeg|png|webp|gif)$/.test(url)) {
    return <img src={ev.blob_url} className="h-32 w-full object-cover rounded-lg" />;
  }

  if (/\.(mp4|webm)$/.test(url)) {
    return <video src={ev.blob_url} controls className="h-32 w-full rounded-lg" />;
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
