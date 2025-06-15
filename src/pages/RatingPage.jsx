import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RatingsPage() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/ratings/entities`)
      .then(res => res.json())
      .then(data => setEntities(data));
  }, []);

  const filtered = entities.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-[#0A2A42]">Public Ratings</h1>
      <input
        type="text"
        placeholder="Search officials, agencies, or institutions"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border px-4 py-2 rounded-xl"
      />
      <div className="space-y-4">
        {filtered.map(entity => (
          <div key={entity.id} className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-xl font-semibold">{entity.name}</h2>
            <p className="text-sm text-gray-600 capitalize">{entity.type} • {entity.category}</p>
            <p className="text-sm text-gray-500">Jurisdiction: {entity.jurisdiction || 'N/A'}</p>
            <p className="mt-2 text-yellow-600 font-semibold">Reputation Score: {entity.reputation_score.toFixed(1)}</p>
            <Link to={`/ratings/${entity.id}`} className="text-blue-600 underline mt-2 inline-block">
              View & Rate
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
