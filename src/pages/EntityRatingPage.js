import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import ShareButton from "../components/ShareButton";

export default function EntityRatingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingRating, setExistingRating] = useState(null);

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

  /* --------------------------------------------------
     Load entity + existing rating (if any)
  -------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const entityRes = await api.get("/ratings/entities");
        const found = entityRes.data.find((e) => e.id.toString() === id);
        if (!found) return navigate("/ratings");

        setEntity(found);

        // Try to load existing rating
        try {
          const ratingRes = await api.get(
            `/ratings/mine?entity_id=${id}`
          );
          const r = ratingRes.data;

          setExistingRating(r);
          setForm({
            accountability: r.accountability,
            respect: r.respect,
            effectiveness: r.effectiveness,
            transparency: r.transparency,
            public_impact: r.public_impact,
            comment: r.comment || "",
          });
          setViolatedRights(r.violated_rights || []);
        } catch {
          // No existing rating → leave defaults
          setExistingRating(null);
        }
      } catch (err) {
        console.error("Failed to load rating page", err);
        navigate("/ratings");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, navigate]);

  /* --------------------------------------------------
     Submit or Update Rating
  -------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/ratings/submit", {
        entity_id: parseInt(id),
        ...form,
        violated_rights: violatedRights,
      });

      alert(existingRating ? "Rating updated" : "Rating submitted");
      navigate(`/ratings/${id}`);
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
        {/* NAV */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(`/ratings/${entity.id}`)}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Profile
          </button>

          <ShareButton
            url={`/ratings/${entity.id}`}
            label="Share profile"
          />
        </div>

        {/* ENTITY CARD */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-[#283d63]">
            {entity.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">
            {entity.type} • {entity.category}
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
          {/* SCORES */}
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
                <label className="block mb-3 text-sm font-semibold uppercase">
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
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                          active
                            ? "bg-[#c2a76d] border-[#c2a76d]"
                            : "bg-gray-100 border-gray-300"
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

          {/* COMMENT */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <label className="block mb-3 text-sm font-semibold uppercase">
              Comment (optional)
            </label>
            <textarea
              value={form.comment}
              onChange={(e) =>
                setForm({ ...form, comment: e.target.value })
              }
              rows={4}
              className="w-full border rounded-xl px-4 py-2"
            />
          </div>

          {/* RIGHTS */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <label className="block mb-3 text-sm font-semibold uppercase">
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
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                      active
                        ? "bg-[#c2a76d] border-[#c2a76d]"
                        : "bg-gray-100 border-gray-300"
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
              className="bg-[#283d63] hover:bg-[#1d2c49] text-white px-6 py-3 rounded-xl font-semibold"
            >
              {existingRating ? "Update Rating" : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
