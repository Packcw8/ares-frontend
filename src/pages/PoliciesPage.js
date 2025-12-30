import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/policies")
      .then(res => setPolicies(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = policies.filter(p => {
    if (level !== "all" && p.jurisdiction_level !== level) return false;
    if (search.trim()) {
      return (
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.summary || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#3a2f1b]">
            Public Policies & Laws
          </h1>
        </div>

        <p className="text-sm text-[#5a4635] max-w-3xl">
          This section documents public policies and laws across federal and state
          jurisdictions. Status changes are reviewed for accuracy before appearing publicly.
        </p>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search policies…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-[#ede3cb] border border-[#c2a76d]"
          />

          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="px-4 py-3 rounded-lg bg-[#ede3cb] border border-[#c2a76d]"
          >
            <option value="all">All Jurisdictions</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
          </select>
        </div>

        {/* RESULTS */}
        {loading ? (
          <p className="italic opacity-60">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="italic opacity-60">No policies found.</p>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {filtered.map(policy => (
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
                  hover:border-[#8b1e3f]
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

                  <span className="italic">
                    Status ID: {policy.current_status_id ?? "—"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
