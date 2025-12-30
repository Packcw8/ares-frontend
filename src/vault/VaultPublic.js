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
      ) return false;

      if (
        countyFilter &&
        !entity.county?.toLowerCase().includes(countyFilter.toLowerCase())
      ) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          entity.name,
          item.description,
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

        {/* INFO BOX */}
        <div className="
          relative
          rounded-2xl
          border border-indigo-200
          bg-gradient-to-br from-indigo-50 to-slate-50
          p-6
          text-sm
          text-slate-700
        ">
          <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500 rounded-l-2xl" />

          <p className="font-semibold text-slate-900 mb-1">
            What is the Community Records feed?
          </p>

          <p className="mb-3">
            This page displays publicly shared records, ratings, and supporting
            materials connected to public-facing entities. Entries document
            experiences and observations — not legal conclusions.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-600">
              Don’t see the entity you’re looking for?
            </p>

            <button
              onClick={() => navigate("/ratings/new")}
              className="
                inline-flex items-center
                rounded-lg
                bg-indigo-600
                px-4 py-2
                text-sm font-medium
                text-white
                hover:bg-indigo-700
                transition
                shadow-sm
              "
            >
              Add a public entity →
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entity or text…"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            placeholder="State (e.g. WV)"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            placeholder="County (optional)"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
    <div className="
      rounded-3xl
      bg-white
      border border-slate-200
      shadow-md
      hover:shadow-lg
      transition
      overflow-hidden
    ">
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
        {item.type === "rating" && (
          <>
            {item.rating?.comment && (
              <div className="rounded-xl border border-slate-200 bg-indigo-50 p-4">
                <p className="text-sm text-slate-700 italic">
                  “{item.rating.comment}”
                </p>
              </div>
            )}

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
                  <span className="font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>

            {entity && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-sm text-slate-600">Community Score</span>
                <span className="text-lg font-bold text-indigo-600">
                  {Math.round(entity.reputation_score)}
                </span>
              </div>
            )}

            {entity && (
              <button
                onClick={() => navigate(`/ratings/${entity.id}`)}
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:underline"
              >
                View entity & full record →
              </button>
            )}
          </>
        )}

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

      <div className="px-6 py-3 border-t bg-slate-50 text-xs text-slate-500">
        Posted by {item.user?.display_name || "Anonymous"}
      </div>
    </div>
  );
}

/* ======================================================
   EVIDENCE MODAL + RENDER
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
