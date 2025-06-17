import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { stateCountyData } from "../data/stateCountyData";

export default function RatingsPage() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");
  const navigate = useNavigate();

  const baseUrl = "https://ares-api-dev-avetckd5ecdgbred.canadacentral-01.azurewebsites.net";

  useEffect(() => {
    fetch(`${baseUrl}/ratings/entities`)
      .then((res) => res.json())
      .then((data) => setEntities(data))
      .catch(() => {
        console.error("Failed to load ratings data");
      });
  }, []);

  const filtered = entities
    .filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (!stateFilter || e.state === stateFilter) &&
      (!countyFilter || e.county === countyFilter)
    )
    .sort((a, b) => (a.reputation_score ?? 100) - (b.reputation_score ?? 100));

  const stateList = Object.keys(stateCountyData);
  const countyList = stateFilter ? stateCountyData[stateFilter] : [];

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 underline mb-2"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-[#3a2f1b]">Public Ratings</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCountyFilter(""); // reset county when state changes
            }}
          >
            <option value="">All States</option>
            {stateList.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            disabled={!stateFilter}
          >
            <option value="">All Counties</option>
            {countyList.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>

        {/* Add New Official */}
        <div className="text-right">
          <button
            onClick={() => navigate("/ratings/new")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Add New Official
          </button>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <p className="text-gray-500 italic">No matching officials found.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {filtered.map((entity) => (
              <div key={entity.id} className="card">
                <h2 className="text-lg font-extrabold">{entity.name}</h2>
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
                <Link
                  to={`/ratings/${entity.id}`}
                  className="text-[#283d63] underline mt-2 inline-block hover:text-[#1c2b4a]"
                >
                  View & Rate
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
