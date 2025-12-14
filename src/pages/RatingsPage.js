import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
     DYNAMIC SEARCH FILTER
     ========================= */
  const filtered = useMemo(() => {
    if (!search.trim()) return entities;

    const q = search.toLowerCase();

    return entities.filter((e) =>
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
    );
  }, [search, entities]).sort(
    (a, b) => (a.reputation_score ?? 100) - (b.reputation_score ?? 100)
  );

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
            + Add New Official
          </button>
        </div>

        {/* 🔍 DYNAMIC SEARCH */}
        <input
          type="text"
          placeholder="Search officials, courts, agencies, states, counties…"
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
            No matching officials found.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {filtered.map((entity) => (
              <div key={entity.id} className="card">
                {/* ENTITY NAME AS LINK */}
                <Link
                  to={`/ratings/${entity.id}`}
                  className="text-lg font-extrabold text-[#283d63] hover:underline hover:text-[#1c2b4a]"
                >
                  {entity.name}
                </Link>

                <p className="text-sm capitalize text-[#5a4635]">
                  {entity.type} • {entity.category}
                </p>

                <p className="text-sm text-[#5a4635]">
                  {entity.county}, {entity.state}
                </p>

                <p className="mt-2 font-bold text-[#8b1e3f]">
                  Reputation Score:{" "}
                  {typeof entity.reputation_score === "number"
                    ? entity.reputation_score.toFixed(1)
                    : "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
