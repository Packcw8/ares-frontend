import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import ShareButton from "../components/ShareButton";
import { timeAgo } from "../utils/time";
import { displayName } from "../utils/displayName";

export default function VaultPublic() {
  const navigate = useNavigate();

  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* =========================
     LOAD FEED
     ========================= */
  useEffect(() => {
    api.get("/feed")
      .then(res => setFeed(res.data || []))
      .catch(err => console.error("Failed to load feed", err))
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     SEARCH FILTER
     ========================= */
  const filteredFeed = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return feed;

    return feed.filter(item => {
      const e = item.entity || {};
      return (
        e.name?.toLowerCase().includes(q) ||
        e.state?.toLowerCase().includes(q) ||
        e.county?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });
  }, [search, feed]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Community Feed</h1>
            <p className="text-sm text-slate-500">Public records and community activity</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="sticky top-2 z-10 bg-white/80 backdrop-blur rounded-2xl p-3 shadow-sm">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entities, locations, or text…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-slate-500">Loading activity…</p>
        )}

        {/* EMPTY */}
        {!loading && filteredFeed.length === 0 && (
          <div className="py-20 text-center text-slate-500">No activity found.</div>
        )}

        {/* FEED */}
        <div className="space-y-6">
          {filteredFeed.map((item, idx) => (
            <FeedCard
              key={`${item.type}-${idx}`}
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
   FEED CARD – MODERN WALL STYLE
   ====================================================== */
function FeedCard({ item, navigate }) {
  const entity = item.entity;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">

      {/* HEADER */}
      <div className="flex items-start gap-4 px-5 py-4 border-b bg-slate-50">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
          {entity?.name?.charAt(0) || "A"}
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

          {!entity && (
            <p className="text-sm font-semibold text-slate-700">System Activity</p>
          )}

          <p className="text-xs text-slate-500">
            {item.user ? displayName(item) : "System"} · {timeAgo(item.created_at)}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="px-5 py-4 space-y-3">
        {item.type === "vault_record" && (
          <p className="text-sm text-slate-800 whitespace-pre-line">
            {item.description}
          </p>
        )}

        {item.type === "entity_created" && (
          <p className="text-sm text-slate-800">
            A new public entity has been added and is now available for review.
          </p>
        )}

        {item.type === "rating" && (
          <p className="text-sm text-slate-800">
            A new rating was submitted.
            {item.rating?.comment && (
              <span className="block italic opacity-80 mt-1">“{item.rating.comment}”</span>
            )}
          </p>
        )}

        {item.type === "forum_post" && (
          <>
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-800 whitespace-pre-line">{item.body}</p>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center px-5 py-3 border-t bg-slate-50">
        <ShareButton url="/feed" label="Share" />

        {item.type === "forum_post" && item.is_ama && (
          <span className="text-xs font-semibold text-indigo-600">AMA</span>
        )}
      </div>
    </div>
  );
}
