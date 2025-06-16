import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function RatingsPage() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://ares-api-dev-avetckd5ecdgbred.canadacentral-01.azurewebsites.net";

    fetch(`${baseUrl}/ratings/entities`)
      .then(res => res.json())
      .then(data => setEntities(data))
      .catch(() => {
        console.error("Failed to load ratings data");
      });
  }, []);

  const filtered = entities.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-white">Public Ratings</h1>
        <input
          type="text"
          placeholder="Search officials, agencies, or institutions"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded-xl"
        />
        <div className="space-y-4">
          {filtered.map(entity => (
            <div key={entity.id} className="bg-gray-800 rounded-xl p-4 shadow">
              <h2 className="text-xl font-semibold text-white">{entity.name}</h2>
              <p className="text-sm text-gray-400 capitalize">
                {entity.type} • {entity.category}
              </p>
              <p className="text-sm text-gray-500">
                Jurisdiction: {entity.jurisdiction || "N/A"}
              </p>
              <p className="mt-2 text-yellow-400 font-semibold">
                Reputation Score: {entity.reputation_score.toFixed(1)}
              </p>
              <Link
                to={`/ratings/${entity.id}`}
                className="text-blue-400 underline mt-2 inline-block"
              >
                View & Rate
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
