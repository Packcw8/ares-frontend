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
        <div className="p-6">Loading…</div>
      </Layout>
    );
  }

  if (!entity) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-8">

        {/* BACK */}
        <button
          onClick={() => navigate("/ratings")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Ratings
        </button>

        {/* ENTITY PROFILE CARD */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-[#283d63]">{entity.name}</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">
            {entity.type} • {entity.category}
            {entity.jurisdiction && ` • ${entity.jurisdiction}`}
          </p>

          <div className="mt-4 inline-flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
            <span className="text-sm text-gray-600">Reputation</span>
            <span className="text-xl font-bold text-[#c2a76d]">
              {entity.reputation_score?.toFixed(1) ?? "—"}
            </span>
          </div>
        </div>

        {/* RATING FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SCORE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "accountability",
              "respect",
              "effectiveness",
              "transparency",
              "public_impact",
            ].map((key) => (
              <div
                key={key}
                className="bg-white rounded-2xl border shadow-sm p-5"
              >
                <label className="block mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {key.replace("_", " ")}
                </label>

                <div className="flex flex-wrap gap-2">
                  {[...Array(10)].map((_, i) => {
                    const val = i + 1;
                    const active = form[key] === val;
                    return (
                      <button
                        type="button"
                        key={val}
                        onClick={() =>
                          setForm({ ...form, [key]: val })
                        }
                        className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${
                          active
                            ? "bg-[#c2a76d] text-black border-[#c2a76d]"
                            : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-[#c2a76d]/20"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* COMMENT CARD */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <label className="block mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Comment (optional)
            </label>
            <textarea
              value={form.comment}
              onChange={(e) =>
                setForm({ ...form, comment: e.target.value })
              }
              rows={4}
              placeholder="Describe the experience, issue, or concern…"
              className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2a76d]"
            />
          </div>

          {/* RIGHTS CARD */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <label className="block mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              🛡️ Rights Potentially Violated (optional)
            </label>

            <div className="flex flex-wrap gap-2">
              {RIGHTS_OPTIONS.map((r) => {
                const active = violatedRights.includes(r.value);
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() =>
                      setViolatedRights((prev) =>
                        active
                          ? prev.filter((v) => v !== r.value)
                          : [...prev, r.value]
                      )
                    }
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                      active
                        ? "bg-[#c2a76d] text-black border-[#c2a76d]"
                        : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-[#c2a76d]/20"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUBMIT */}
          <div className="text-right">
            <button
              type="submit"
              className="bg-[#283d63] hover:bg-[#1d2c49] text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Submit Rating
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
