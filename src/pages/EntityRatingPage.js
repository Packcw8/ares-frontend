import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function EntityRatingPage() {
  const { id } = useParams();
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    accountability: 5,
    respect: 5,
    effectiveness: 5,
    transparency: 5,
    public_impact: 5,
    comment: "",
  });
  const navigate = useNavigate();

  const baseUrl = "https://ares-api-dev-avetckd5ecdgbred.canadacentral-01.azurewebsites.net";

  useEffect(() => {
    fetch(`${baseUrl}/ratings/entities`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((e) => e.id.toString() === id);
        if (found) setEntity(found);
        else navigate("/ratings");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]); // ✅ FIXED: added 'navigate' here

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/ratings/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entity_id: parseInt(id),
          user_id: 1, // replace with logged-in user id if available
          ...form,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit rating");

      alert("Rating submitted successfully");
      navigate("/ratings");
    } catch (err) {
      alert(err.message || "Submission failed");
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-white p-4">Loading...</p>
      </Layout>
    );
  }

  if (!entity) return null;

  return (
    <Layout>
      <div className="p-4 space-y-6 text-white">
        <button
          onClick={() => navigate("/ratings")}
          className="text-blue-400 underline"
        >
          ← Back to Ratings
        </button>

        <h1 className="text-2xl font-bold">{entity.name}</h1>
        <p className="text-gray-400 capitalize">
          {entity.type} • {entity.category} • {entity.jurisdiction}
        </p>
        <p className="text-yellow-400">
          Current Reputation: {entity.reputation_score.toFixed(1)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["accountability", "respect", "effectiveness", "transparency", "public_impact"].map((key) => (
            <div key={key}>
              <label className="block capitalize mb-1">
                {key.replace("_", " ")}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-900 text-white rounded"
              />
            </div>
          ))}
          <textarea
            placeholder="Optional comment or complaint"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Submit Rating
          </button>
        </form>
      </div>
    </Layout>
  );
}
