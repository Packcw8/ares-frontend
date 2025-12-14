import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function RatingsPage() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await api.get("/ratings/entities");
        if (mounted) setEntities(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load ratings data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

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
     SEARCH FILTER
     ========================= */
  const filtered = useMemo(() => {
    if (!search.trim()) return entities;

    const q = search.toLowerCase();

    return entities
      .filter((e) =>
        [
          e.name,
          e.state,
          e.county,
          e.category,
          e.type,
          e.jurisdiction,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .sort(
        (a, b) => (a.reputation_score ?? 100) - (b.reputation_score ?? 100)
      );
  }, [search, entities]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#3a2f1b]">
            Public Ratings
          </h1>

          <button
            onClick={() => navigate("/ratings/new")}
            className="bg-[#8b1e3f] hover:bg-[#72162f] text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Add New Entity
          </button>
        </div>

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
        ) : filtered.length === 0 ? (
          <p className="italic opacity-60">
            No matching entities found.
          </p>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {filtered.map((entity) => (
              <button
                key={entity.id}
                onClick={() => navigate(`/ratings/${entity.id}`)}
                className="
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
                  {/* SILHOUETTE */}
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

                  {/* INFO */}
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
                        Reputation Score
                      </span>
                      <span className="text-lg font-bold text-[#8b1e3f]">
                        {typeof entity.reputation_score === "number"
                          ? entity.reputation_score.toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
