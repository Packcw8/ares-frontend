import { useEffect, useMemo, useState, useRef } from "react";
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
  const [stateQuery, setStateQuery] = useState("");
  const [countyFilter, setCountyFilter] = useState("");
  const [countyQuery, setCountyQuery] = useState("");

  // Evidence modal
  const [activeEvidence, setActiveEvidence] = useState(null);

  // refs for closing dropdowns
  const stateRef = useRef(null);
  const countyRef = useRef(null);

  useEffect(() => {
    api
      .get("/feed")
      .then(res => setFeed(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     CLICK OUTSIDE TO CLOSE
     ========================= */
  useEffect(() => {
    function handleClickOutside(e) {
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setStateQuery(stateFilter || "");
      }
      if (countyRef.current && !countyRef.current.contains(e.target)) {
        setCountyQuery(countyFilter || "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [stateFilter, countyFilter]);

  /* =========================
     AUTOCOMPLETE DATA
     ========================= */
  const states = useMemo(() => {
    return [...new Set(feed.map(f => f.entity?.state).filter(Boolean))].sort();
  }, [feed]);

  const counties = useMemo(() => {
    return [
      ...new Set(
        feed
          .filter(f => !stateFilter || f.entity?.state === stateFilter)
          .map(f => f.entity?.county)
          .filter(Boolean)
      ),
    ].sort();
  }, [feed, stateFilter]);

  /* =========================
     FILTERED FEED
     ========================= */
  const filteredFeed = useMemo(() => {
    return feed.filter(item => {
      const entity = item.entity || {};

      if (stateFilter && entity.state !== stateFilter) return false;
      if (countyFilter && entity.county !== countyFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const text = (
          entity.name ||
          item.description ||
          item.testimony ||
          ""
        ).toLowerCase();
        if (!text.includes(q)) return false;
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

          {/* STATE */}
          <div ref={stateRef} className="relative">
            <input
              value={stateQuery}
              onChange={e => {
                setStateQuery(e.target.value);
                setStateFilter("");
                setCountyFilter("");
                setCountyQuery("");
              }}
              placeholder="State"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />

            {stateQuery && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow">
                {states
                  .filter(s =>
                    s.toLowerCase().startsWith(stateQuery.toLowerCase())
                  )
                  .slice(0, 8)
                  .map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStateFilter(s);
                        setStateQuery(s);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      {s}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* COUNTY */}
          <div ref={countyRef} className="relative">
            <input
              value={countyQuery}
              onChange={e => {
                setCountyQuery(e.target.value);
                setCountyFilter("");
              }}
              placeholder="County"
              disabled={!stateFilter}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm disabled:opacity-60"
            />

            {countyQuery && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow">
                {counties
                  .filter(c =>
                    c.toLowerCase().startsWith(countyQuery.toLowerCase())
                  )
                  .slice(0, 8)
                  .map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCountyFilter(c);
                        setCountyQuery(c);
                      }}
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
              key={`${item.type}-${item.created_at}`}
              item={item}
              navigate={navigate}
              onOpenEvidence={setActiveEvidence}
            />
          ))}
        </div>
      </div>

      {activeEvidence && (
        <EvidenceModal ev={activeEvidence} onClose={() => setActiveEvidence(null)} />
      )}
    </Layout>
  );
}

/* ======================================================
   PUBLIC CARD
   ====================================================== */
function PublicVaultCard({ item, navigate, onOpenEvidence }) {
  const entity = item.entity;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
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

      <div className="px-6 py-4 space-y-4">

        {/* RATING */}
        {item.type === "rating" && (
          <>
            <p className="text-sm font-semibold text-slate-900">
              This official was ranked
            </p>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(item.rating?.scores || {}).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between bg-slate-50 rounded-lg px-3 py-2"
                >
                  <span className="capitalize text-slate-600">
                    {k.replace("_", " ")}
                  </span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* VAULT RECORD */}
        {item.type === "vault_record" && (
          <>
            <p className="text-sm text-slate-800 whitespace-pre-line">
              {item.description}
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
          </>
        )}
      </div>

      <div className="px-6 py-3 border-t bg-slate-50 text-xs text-slate-500">
        Posted by {item.user?.display_name || "Anonymous"}
      </div>
    </div>
  );
}

/* ======================================================
   EVIDENCE
   ====================================================== */
function EvidenceModal({ ev, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-black"
        >
          ✕
        </button>
        {renderEvidence(ev, true)}
        {ev.description && (
          <p className="mt-3 text-sm text-slate-600">{ev.description}</p>
        )}
      </div>
    </div>
  );
}

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
    <a href={ev.blob_url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
      Open file
    </a>
  );
}
