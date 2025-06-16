import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function RatingsPage() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const baseUrl =
      "https://ares-api-dev-avetckd5ecdgbred.canadacentral-01.azurewebsites.net";

    fetch(`${baseUrl}/ratings/entities`)
      .then((res) => res.json())
      .then((data) => setEntities(data))
      .catch(() => {
        console.error("Failed to load ratings data");
      });
  }, []);

  // Apply filters: search, state, county
  const filtered = entities
    .filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (!stateFilter || (e.jurisdiction || "").toLowerCase().includes(stateFilter.toLowerCase())) &&
      (!countyFilter || (e.jurisdiction || "").toLowerCase().includes(countyFilter.toLowerCase()))
    )
    .sort((a, b) =>
      (a.reputation_score ?? 100) - (b.reputation_score ?? 100)
    );

  return (
    <Layout>
      <div className="p-4 space-y-6 text-white">
        {/* Back to Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-400 underline mb-2"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold">Public Ratings</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded-xl"
          />
          <input
            type="text"
            placeholder="Filter by state"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded-xl"
          />
          <input
            type="text"
            placeholder="Filter by county"
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded-xl"
          />
        </div>

        {/* Add New Official */}
        <div className="text-right">
          <button
            onClick={() => alert("TODO: Navigate to Add Official Form")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Add New Official
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-gray-400">No matching officials found.</p>
          ) : (
            filtered.map((entity) => (
              <div
                key={entity.id}
                className="bg-gray-800 rounded-xl p-4 shadow"
              >
                <h2 className="text-xl font-semibold text-white">{entity.name}</h2>
                <p className="text-sm text-gray-400 capitalize">
                  {entity.type} • {entity.category}
                </p>
                <p className="text-sm text-gray-500">
                  Jurisdiction: {entity.jurisdiction || "N/A"}
                </p>
                <p className="mt-2 text-yellow-400 font-semibold">
                  Reputation Score: {typeof entity.reputation_score === "number"
                    ? entity.reputation_score.toFixed(1)
                    : "N/A"}
                </p>
                <Link
                  to={`/ratings/${entity.id}`}
                  className="text-blue-400 underline mt-2 inline-block"
                >
                  View & Rate
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
