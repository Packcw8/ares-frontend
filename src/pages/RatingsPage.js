import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import BrowseSwitcher from "../components/BrowseSwitcher";

export default function RatingsPage() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  /* =========================
     DATA LOADER
     ========================= */
  const loadEntities = async ({ reset = false, searchQuery = null } = {}) => {
    if (loadingMore) return;

    if (reset) {
      setEntities([]);
      setHasMore(true);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // 🔍 SEARCH MODE (server-side, no pagination)
      if (searchQuery && searchQuery.trim()) {
        const res = await api.get("/ratings/entities", {
          params: { search: searchQuery.trim() },
        });

        setEntities(Array.isArray(res.data) ? res.data : []);
        setHasMore(false);
        return;
      }

      // 📜 BROWSE MODE (cursor pagination)
      const last = entities[entities.length - 1];

      const res = await api.get("/ratings/entities", {
        params: {
          limit: 20,
          cursor_score: last?.reputation_score,
          cursor_id: last?.id,
        },
      });

      const newItems = Array.isArray(res.data) ? res.data : [];

      // ✅ DE-DUPE BY ID (critical fix)
      setEntities((prev) => {
        const merged = reset ? newItems : [...prev, ...newItems];
        const map = new Map();

        for (const e of merged) {
          if (e && e.id != null) {
            map.set(e.id, e);
          }
        }

        return Array.from(map.values());
      });

      if (newItems.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load ratings data", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /* =========================
     INITIAL LOAD
     ========================= */
  useEffect(() => {
    loadEntities({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     SEARCH HANDLER
     ========================= */
  useEffect(() => {
    if (search.trim()) {
      loadEntities({ reset: true, searchQuery: search });
    } else {
      loadEntities({ reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* =========================
     INFINITE SCROLL
     ========================= */
  useEffect(() => {
    if (!hasMore || search.trim()) return;

    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400;

      if (nearBottom && !loadingMore) {
        loadEntities();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, search, entities]);

  /* =========================
     SILHOUETTE PICKER
     ========================= */
  const getSilhouette = (entity) => {
    const t = `${entity.type || ""} ${entity.category || ""}`.toLowerCase();

    if (t.includes("court") || t.includes("judge")) return "🏛️";
    if (t.includes("agency") || t.includes("department")) return "🏢";
    if (t.includes("police") || t.includes("sheriff")) return "🚓";
    if (t.includes("council") || t.includes("legislature")) return "🏛️";
    if (t.includes("official") || t.includes("individual")) return "👤";

    return "👥";
  };

  /* =========================
     FRONTEND-ONLY TREND LOGIC
     ========================= */
  const getTrend = (entity) => {
    if (typeof entity.reputation_score !== "number") return "neutral";

    const key = `entity_score_${entity.id}`;
    const last = Number(localStorage.getItem(key));
    const current = entity.reputation_score;

    let trend = "neutral";
    if (!isNaN(last)) {
      if (current > last) trend = "up";
      else if (current < last) trend = "down";
    }

    localStorage.setItem(key, current);
    return trend;
  };

  const trendUI = {
    up: { symbol: "▲", className: "text-green-600" },
    down: { symbol: "▼", className: "text-red-600" },
    neutral: { symbol: "•", className: "text-gray-500" },
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#3a2f1b]">
            Public Ratings
          </h1>

          <div className="flex items-center gap-3">
            <BrowseSwitcher />

            <button
              onClick={() => navigate("/ratings/new")}
              className="bg-[#8b1e3f] hover:bg-[#72162f] text-white px-4 py-2 rounded-lg font-semibold"
            >
              + Add New Entity
            </button>
          </div>
        </div>

        {/* EXPLANATION */}
        <p className="text-sm text-[#5a4635] max-w-3xl">
          Reputation scores begin at <strong>50</strong> as a neutral
          baseline. Scores may rise or fall over time based on community
          ratings and verification.
        </p>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search entities, courts, agencies, states, counties…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full
            px-4
            py-3
            rounded-lg
            bg-[#ede3cb]
            border
            border-[#c2a76d]
            placeholder:text-[#5a4635]
          "
        />

        {/* RESULTS */}
        {loading ? (
          <p className="italic opacity-60">Loading…</p>
        ) : entities.length === 0 ? (
          <p className="italic opacity-60">
            No matching entities found. Be the first to add one.
          </p>
        ) : (
          <>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              {entities.map((entity) => {
                const trend = getTrend(entity);

                return (
                  <Link
                    key={entity.id}
                    to={`/ratings/${entity.id}`}
                    className="
                      block
                      text-left
                      rounded-2xl
                      border
                      border-[#c2a76d]
                      bg-[#f7f1e1]
                      p-5
                      shadow-sm
                      transition-all
                      duration-200
                      hover:-translate-y-1
                      hover:shadow-xl
                      hover:border-[#8b1e3f]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#8b1e3f]
                    "
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          text-3xl
                          bg-[#ede3cb]
                          border
                          border-[#c2a76d]
                          rounded-full
                          w-12
                          h-12
                          flex
                          items-center
                          justify-center
                          shrink-0
                        "
                      >
                        {getSilhouette(entity)}
                      </div>

                      <div className="flex-1">
                        <h2 className="text-lg font-extrabold text-[#283d63]">
                          {entity.name}
                        </h2>

                        <p className="text-sm capitalize text-[#5a4635] mt-1">
                          {entity.type} • {entity.category}
                        </p>

                        <p className="text-sm text-[#5a4635]">
                          {entity.county}, {entity.state}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-[#3a2f1b]">
                            Reputation Index
                          </span>

                          <span className="text-lg font-bold text-[#8b1e3f] flex items-center gap-1">
                            {typeof entity.reputation_score === "number"
                              ? entity.reputation_score.toFixed(1)
                              : "N/A"}
                            <span className={trendUI[trend].className}>
                              {trendUI[trend].symbol}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {loadingMore && (
              <p className="text-center text-sm opacity-60 mt-4">
                Loading more…
              </p>
            )}

            {!hasMore && !search.trim() && (
              <p className="text-center text-sm opacity-50 mt-4">
                End of rankings
              </p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
