import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import BrowseSwitcher from "../components/BrowseSwitcher";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("worst"); // worst | best | neutral

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [policyRes, entityRes] = await Promise.all([
          api.get("/policies"),
          api.get("/ratings/entities"),
        ]);

        setPolicies(policyRes.data || []);
        setEntities(entityRes.data || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // attach reputation score from rated_entities
  const enriched = policies.map((p) => {
    const entity = entities.find((e) => e.id === p.rated_entity_id);
    return {
      ...p,
      reputation_score: entity?.reputation_score ?? null,
    };
  });

  const filtered = enriched
    .filter((p) => {
      if (level !== "all" && p.jurisdiction_level !== level) return false;
      if (search.trim()) {
        return (
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.summary || "").toLowerCase().includes(search.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "neutral") return 0;
      if (a.reputation_score == null) return 1;
      if (b.reputation_score == null) return -1;
      return sort === "worst"
        ? a.reputation_score - b.reputation_score
        : b.reputation_score - a.reputation_score;
    });

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#3a2f1b]">
            Public Policies & Laws
          </h1>

          <BrowseSwitcher />
        </div>

        <p className="text-sm text-[#5a4635] max-w-3xl">
          Publicly reviewed policies ranked by real-world impact.
        </p>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search policies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-[#ede3cb] border border-[#c2a76d]"
          />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-3 rounded-lg bg-[#ede3cb] border border-[#c2a76d]"
          >
            <option value="all">All Jurisdictions</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 rounded-lg bg-[#ede3cb] border border-[#c2a76d]"
          >
            <option value="worst">Most Harmful</option>
            <option value="best">Least Harmful</option>
            <option value="neutral">Unsorted</option>
          </select>
        </div>

        {/* RESULTS */}
        {loading ? (
          <p className="italic opacity-60">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="italic opacity-60">No policies found.</p>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {filtered.map((policy) => (
              <button
                key={policy.id}
                onClick={() => navigate(`/policies/${policy.id}`)}
                className="
                  text-left
                  rounded-2xl
                  border
                  border-[#c2a76d]
                  bg-[#f7f1e1]
                  p-5
                  shadow-sm
                  transition-all
                  hover:-translate-y-1
                  hover:shadow-xl
                "
              >
                <h2 className="text-lg font-bold text-[#283d63]">
                  {policy.title}
                </h2>

                <p className="text-sm text-[#5a4635] mt-2 line-clamp-3">
                  {policy.summary || "No summary available."}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-[#5a4635]">
                  <span className="capitalize">
                    {policy.jurisdiction_level}
                    {policy.state_code ? ` — ${policy.state_code}` : ""}
                  </span>

                  {policy.reputation_score != null && (
                    <span className="font-bold text-[#8b1e3f]">
                      Score: {policy.reputation_score.toFixed(1)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
