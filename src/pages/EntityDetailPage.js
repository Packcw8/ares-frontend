import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function EntityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const RIGHTS_MAP = {
    "1st": "🗣️ 1st – Free Speech & Petition",
    "4th": "🔒 4th – No Unreasonable Search",
    "14th": "⚖️ 14th – Due Process / Equal Protection",
    "9th": "📜 9th – Unenumerated Rights",
    "10th": "🛡️ 10th – People's Power",
    "6th": "🏛️ 6th – Supreme Law of the Land",
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const entityRes = await api.get("/ratings/entities");
        const found = entityRes.data.find((e) => e.id.toString() === id);
        if (!found) return navigate("/ratings");

        setEntity(found);

        const reviewsRes = await api.get(`/ratings/entity/${id}/reviews`);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error("Error loading entity or reviews", err);
        navigate("/ratings");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, navigate]);

  if (loading) return <Layout><div className="p-4">Loading...</div></Layout>;
  if (!entity) return null;

  return (
    <Layout>
      <div className="space-y-6 text-[#1e1e1e]">
        <button
          onClick={() => navigate("/ratings")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Ratings
        </button>

        <h1 className="text-3xl font-bold">{entity.name}</h1>
        <p className="capitalize text-gray-600">
          {entity.type} • {entity.category} • {entity.county}, {entity.state}
        </p>
        <p className="text-lg font-semibold text-yellow-600">
          Reputation Score: {entity.reputation_score.toFixed(1)}
        </p>

        <div className="mt-4">
          <button
            onClick={() => navigate(`/ratings/${entity.id}/rate`)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm font-semibold"
          >
            Leave a Rating
          </button>
        </div>

        <hr className="border-[#c2a76d]" />

        <h2 className="text-2xl font-bold mt-4">Public Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="border border-[#c2a76d] rounded-lg p-4 bg-[#fdf7e3] shadow"
              >
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Accountability:</strong> {r.accountability}</p>
                  <p><strong>Respect:</strong> {r.respect}</p>
                  <p><strong>Effectiveness:</strong> {r.effectiveness}</p>
                  <p><strong>Transparency:</strong> {r.transparency}</p>
                  <p><strong>Public Impact:</strong> {r.public_impact}</p>
                  <p><strong>Verified:</strong> {r.verified ? "✅" : "❌"}</p>
                </div>

                {r.violated_rights?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.violated_rights.map((right) => (
                      <span
                        key={right}
                        className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full border border-red-400"
                      >
                        {RIGHTS_MAP[right] || right}
                      </span>
                    ))}
                  </div>
                )}

                {r.comment && (
                  <p className="italic mt-3 pt-2 text-sm border-t border-yellow-400">
                    “{r.comment}”
                  </p>
                )}
                <p className="text-xs text-right text-gray-500 mt-1">
                  Submitted {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
