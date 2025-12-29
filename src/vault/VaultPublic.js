import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultPublic() {
  const navigate = useNavigate();

  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple text filters (no dropdowns)
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");

  // Evidence modal
  const [activeEvidence, setActiveEvidence] = useState(null);

  useEffect(() => {
    api
      .get("/feed")
      .then((res) => setFeed(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     FILTERED FEED (TYPE-TO-FILTER)
     ========================= */
  const filteredFeed = useMemo(() => {
    return feed.filter((item) => {
      const entity = item.entity || {};

      if (
        stateFilter &&
        !entity.state?.toLowerCase().includes(stateFilter.toLowerCase())
      ) {
        return false;
      }

      if (
        countyFilter &&
        !entity.county?.toLowerCase().includes(countyFilter.toLowerCase())
      ) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          entity.name,
          item.description,
          item.testimony,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [feed, search, stateFilter, countyFilter]);

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entity or text…"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />

          <input
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            placeholder="State (e.g. WV)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />

          <input
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            placeholder="County (optional)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />
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
          {filteredFeed.map((item, idx) => (
            <PublicVaultCard
              key={`${item.type}-${item.created_at}-${idx}`}
              item={item}
              navigate={navigate}
              onOpenEvidence={setActiveEvidence}
            />
          ))}
        </div>
      </div>

      {activeEvidence && (
        <EvidenceModal
          ev={activeEvidence}
          onClose={() => setActiveEvidence(null)}
        />
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
            {entity?.county && `${entity.county}, `}
            {entity?.state}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="px-6 py-4 space-y-4">
        {/* RATING ENTRY */}
        {item.type === "rating" && (
          <>
            <p className="text-sm font-semibold text-slate-900">
              Community insight was shared. Others may add context or experience.
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
                  <span className="font-semibold text-slate-900">
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {entity && (
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/ratings/${entity.id}`)}
                  className="
                    inline-flex items-center
                    rounded-lg
                    border border-slate-200
                    bg-white
                    px-3 py-1.5
                    text-xs font-medium
                    text-slate-700
                    hover:bg-slate-100
                    transition
                  "
                >
                  View entity & add insight →
                </button>
              </div>
            )}
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
                {item.evidence.map((ev) => (
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

      {/* FOOTER */}
      <div className="px-6 py-3 border-t bg-slate-50 text-xs text-slate-500">
        Posted by {item.user?.display_name || "Anonymous"}
      </div>
    </div>
  );
}

/* ======================================================
   EVIDENCE MODAL
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
          <p className="mt-3 text-sm text-slate-600">
            {ev.description}
          </p>
        )}
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
    return (
      <img
        src={ev.blob_url}
        alt="Evidence"
        className={`${size} w-full object-contain rounded-lg`}
      />
    );
  }

  if (/\.(mp4|webm)$/.test(url)) {
    return (
      <video
        src={ev.blob_url}
        controls
        className={`${size} w-full rounded-lg`}
      />
    );
  }

  if (/\.(mp3|wav|ogg)$/.test(url)) {
    return <audio src={ev.blob_url} controls className="w-full" />;
  }

  return (
    <a
      href={ev.blob_url}
      target="_blank"
      rel="noreferrer"
      className="text-indigo-600 underline"
    >
      Open file
    </a>
  );
}
