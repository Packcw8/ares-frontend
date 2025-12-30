import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultPublic() {
  const navigate = useNavigate();

  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");

  const [activeEvidence, setActiveEvidence] = useState(null);

  useEffect(() => {
    api
      .get("/feed")
      .then((res) => setFeed(res.data || []))
      .finally(() => setLoading(false));
  }, []);

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
          item.rating?.comment,
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

        {/* INFO */}
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 text-sm text-slate-700 space-y-2">
          <p className="font-semibold text-slate-900">
            What is the Community Records feed?
          </p>
          <p>
            This feed displays publicly shared records, ratings, and supporting
            materials connected to public-facing entities.
          </p>
        </div>

        {/* FILTERS */}
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

        {/* ===== RATING ENTRY ===== */}
        {item.type === "rating" && (
          <div className="space-y-4">

            {/* COMMENT */}
            {item.rating?.comment && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700 italic">
                  “{item.rating.comment}”
                </p>
              </div>
            )}

            {/* CATEGORY SCORES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                ["Accountability", item.rating.accountability],
                ["Respect", item.rating.respect],
                ["Effectiveness", item.rating.effectiveness],
                ["Transparency", item.rating.transparency],
                ["Public Impact", item.rating.public_impact],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* ENTITY SCORE */}
            {entity && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-sm text-slate-600">
                  Community Score
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {Math.round(entity.reputation_score)}
                </span>
              </div>
            )}

            {/* CTA */}
            {entity && (
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
                View entity & full record →
              </button>
            )}
          </div>
        )}

        {/* ===== VAULT RECORD ===== */}
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
