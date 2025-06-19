import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function EntityRatingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const [violatedRights, setViolatedRights] = useState([]);

  const RIGHTS_OPTIONS = [
    { label: "🗣️ 1st – Freedom of Speech & Petition", value: "1st" },
    { label: "🔒 4th – Protection from Unreasonable Search", value: "4th" },
    { label: "⚖️ 14th – Due Process & Equal Protection", value: "14th" },
    { label: "📜 9th – Rights Not Explicitly Listed", value: "9th" },
    { label: "🛡️ 10th – Powers Reserved to the People", value: "10th" },
    { label: "🏛️ 6th – Constitution as Supreme Law", value: "6th" },
  ];

  useEffect(() => {
    api
      .get("/ratings/entities")
      .then((res) => {
        const found = res.data.find((e) => e.id.toString() === id);
        if (found) setEntity(found);
        else navigate("/ratings");
      })
      .catch(() => navigate("/ratings"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/ratings/submit", {
        entity_id: parseInt(id),
        ...form,
        violated_rights: violatedRights,
      });

      alert("Rating submitted successfully");
      navigate("/ratings");
    } catch (err) {
      alert(err.response?.data?.detail || "Submission failed");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 text-white">Loading...</div>
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
          Current Reputation: {entity.reputation_score?.toFixed(1)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {["accountability", "respect", "effectiveness", "transparency", "public_impact"].map((key) => (
            <div key={key}>
              <label className="block mb-2 text-lg font-semibold text-yellow-300 uppercase tracking-wide">
                {key.replace("_", " ")}
              </label>
              <div className="flex flex-wrap gap-2">
                {[...Array(10)].map((_, i) => {
                  const val = i + 1;
                  return (
                    <label
                      key={val}
                      className={`cursor-pointer px-3 py-1 rounded-full border-2 text-sm font-bold transition ${
                        form[key] === val
                          ? "bg-yellow-300 text-black border-yellow-500"
                          : "bg-gray-800 text-white border-gray-700 hover:bg-yellow-500 hover:text-black"
                      }`}
                    >
                      <input
                        type="radio"
                        name={key}
                        value={val}
                        checked={form[key] === val}
                        onChange={() => setForm({ ...form, [key]: val })}
                        className="hidden"
                      />
                      {val}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <label className="block mb-2 text-lg font-semibold text-yellow-300 uppercase tracking-wide">
              Comment
            </label>
            <textarea
              placeholder="Optional comment or complaint"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded"
            />
          </div>

          <div>
            <label className="block mb-2 text-lg font-bold text-yellow-300 uppercase tracking-wide">
              🛡️ Bill of Rights Violated? (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {RIGHTS_OPTIONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-full cursor-pointer border transition font-semibold ${
                    violatedRights.includes(r.value)
                      ? "bg-yellow-300 text-black border-yellow-500"
                      : "bg-gray-800 text-white border-gray-600 hover:bg-yellow-500 hover:text-black"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={r.value}
                    checked={violatedRights.includes(r.value)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setViolatedRights((prev) =>
                        checked
                          ? [...prev, r.value]
                          : prev.filter((v) => v !== r.value)
                      );
                    }}
                    className="hidden"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

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
