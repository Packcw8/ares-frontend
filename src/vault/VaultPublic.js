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
     LOAD UNIFIED FEED
     ========================= */
  useEffect(() => {
    api
      .get("/feed")
      .then((res) => setFeed(res.data || []))
      .catch((err) =>
        console.error("Failed to load unified feed", err)
      )
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     SEARCH FILTER (Nextdoor-style)
     ========================= */
  const filteredFeed = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return feed;

    return feed.filter((item) => {
      const entity = item.entity || {};
      return (
        entity.name?.toLowerCase().includes(q) ||
        entity.state?.toLowerCase().includes(q) ||
        entity.county?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });
  }, [search, feed]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Community Feed
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Local records, ratings, and verified public posts
          </p>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by state, county, or entity…"
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-5
              py-3
              text-sm
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
            "
          />
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-slate-500">
            Loading community activity…
          </p>
        )}

        {/* EMPTY */}
        {!loading && filteredFeed.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-slate-500">
              No activity found.
            </p>
          </div>
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
   FEED CARD (Nextdoor-style)
   ====================================================== */
function FeedCard({ item, navigate }) {
  const entity = item.entity;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 border-b bg-slate-50">
        {entity && (
          <>
            <button
              onClick={() => navigate(`/ratings/${entity.id}`)}
              className="text-sm font-semibold text-indigo-700 hover:underline"
            >
              {entity.name}
            </button>
            <p className="text-xs text-slate-500">
              {entity.county}
              {entity.state ? `, ${entity.state}` : ""}
            </p>
          </>
        )}

        {!entity && item.type === "entity_created" && (
          <p className="text-sm font-semibold text-slate-700">
            New entity added
          </p>
        )}

        <p className="text-xs text-slate-400 mt-1">
          {item.user
            ? `Posted by ${displayName(item)}`
            : "System event"}{" "}
          · {timeAgo(item.created_at)}
        </p>
      </div>

      {/* BODY */}
      <div className="px-6 py-5 space-y-3">
        {item.type === "vault_record" && (
          <p className="text-sm text-slate-800">
            {item.description}
          </p>
        )}

        {item.type === "entity_created" && (
          <p className="text-sm text-slate-800">
            A new public entity is now available for review and
            rating.
          </p>
        )}

        {item.type === "rating" && (
          <p className="text-sm text-slate-800">
            New rating submitted.
            {item.rating?.comment && (
              <>
                <br />
                <span className="italic opacity-80">
                  “{item.rating.comment}”
                </span>
              </>
            )}
          </p>
        )}

        {item.type === "forum_post" && (
          <>
            <h3 className="font-semibold text-slate-900">
              {item.title}
            </h3>
            <p className="text-sm text-slate-800">
              {item.body}
            </p>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-6 pb-5 flex justify-between items-center">
        <ShareButton
          url={`/feed`}
          label="Share"
        />

        {item.type === "forum_post" && item.is_ama && (
          <span className="text-xs font-semibold text-indigo-600">
            AMA
          </span>
        )}
      </div>
    </div>
  );
}
