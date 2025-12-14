import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import ShareButton from "../components/ShareButton";
import { timeAgo, fullDate } from "../utils/time";
import { displayName } from "../utils/displayName";

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

  /* =========================
     SILHOUETTE (NO GENDER)
     ========================= */
  const getSilhouette = (entity) => {
    const t = `${entity.type || ""} ${entity.category || ""}`.toLowerCase();

    if (t.includes("court") || t.includes("judge")) return "🏛️";
    if (t.includes("agency") || t.includes("department")) return "🏢";
    if (t.includes("police") || t.includes("sheriff")) return "🚓";
    if (t.includes("official") || t.includes("individual")) return "👤";

    return "👥";
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const entityRes = await api.get("/ratings/entities");
        const found = entityRes.data.find((e) => e.id.toString() === id);
        if (!found) return navigate("/ratings");

        setEntity(found);

        const reviewsRes = await api.get(`/ratings/entity/${id}/reviews`);
        setReviews(
          reviewsRes.data.map((r) => ({
            ...r,
            _flag_reason: "",
          }))
        );
      } catch (err) {
        console.error("Error loading entity or reviews", err);
        navigate("/ratings");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, navigate]);

  if (loading)
    return (
      <Layout>
        <div className="p-4">Loading…</div>
      </Layout>
    );

  if (!entity) return null;

  return (
    <Layout>
      <div className="space-y-6 text-[#1e1e1e] max-w-4xl mx-auto px-4 pb-24">

        {/* HEADER BAR */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/ratings")}
            className="
              flex items-center gap-2
              text-sm font-semibold
              text-[#283d63]
              hover:text-[#1c2b4a]
            "
          >
            <span className="text-lg">←</span>
            Ratings
          </button>

          <ShareButton url={`/ratings/${entity.id}`} label="Share profile" />
        </div>

        {/* ENTITY PROFILE CARD */}
        <div className="bg-white rounded-2xl border border-[#e5dcc3] p-6 shadow">

          <div className="flex items-start gap-4">
            {/* SILHOUETTE BADGE */}
            <div
              className="
                w-14 h-14
                rounded-full
                bg-[#ede3cb]
                border border-[#c2a76d]
                flex items-center justify-center
                text-3xl
                shrink-0
              "
            >
              {getSilhouette(entity)}
            </div>

            {/* ENTITY INFO */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">
                {entity.name}
              </h1>

              <p className="capitalize text-gray-600 mb-2">
                {entity.type} • {entity.category} • {entity.county}, {entity.state}
              </p>

              <p className="text-lg font-semibold text-yellow-600">
                Reputation Score: {entity.reputation_score.toFixed(1)}
              </p>

              <div className="mt-4">
                <button
                  onClick={() => navigate(`/ratings/${entity.id}/rate`)}
                  className="
                    bg-blue-700 hover:bg-blue-800
                    text-white
                    px-4 py-2
                    rounded
                    text-sm
                    font-semibold
                  "
                >
                  Leave a Rating
                </button>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-[#c2a76d]" />

        {/* REVIEWS */}
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
                <div className="text-xs text-gray-600 mb-2">
                  Submitted by{" "}
                  <span className="font-semibold">
                    {displayName(r)}
                  </span>
                </div>

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
                        className="
                          bg-red-100
                          text-red-800
                          text-xs
                          font-semibold
                          px-3 py-1
                          rounded-full
                          border border-red-400
                        "
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

                <p
                  className="text-xs text-right text-gray-500 mt-1"
                  title={fullDate(r.created_at)}
                >
                  Submitted {timeAgo(r.created_at)}
                </p>

                {!r.flagged ? (
                  <details className="text-sm mt-2">
                    <summary className="text-red-600 cursor-pointer hover:underline font-semibold">
                      ⚠️ Flag This Review
                    </summary>
                    <div className="mt-2">
                      <textarea
                        placeholder="Describe the issue (false claim, hate speech, spam)…"
                        className="w-full p-2 rounded bg-white border border-yellow-400 mb-2"
                        rows={2}
                        onChange={(e) => (r._flag_reason = e.target.value)}
                      />
                      <button
                        className="bg-red-700 text-white px-4 py-1 rounded hover:bg-red-800 font-semibold text-sm"
                        onClick={async () => {
                          if (!r._flag_reason || r._flag_reason.trim().length < 5) {
                            alert("Please enter a reason at least 5 characters long.");
                            return;
                          }
                          try {
                            await api.post(`/ratings/flag-rating/${r.id}`, {
                              reason: r._flag_reason,
                            });
                            alert(
                              "Thank you. This review has been submitted for constitutional review."
                            );
                            setReviews((prev) =>
                              prev.map((rev) =>
                                rev.id === r.id ? { ...rev, flagged: true } : rev
                              )
                            );
                          } catch (err) {
                            alert(
                              err.response?.data?.detail ||
                                "Failed to flag this review."
                            );
                          }
                        }}
                      >
                        Submit Flag
                      </button>
                    </div>
                  </details>
                ) : (
                  <p className="text-xs text-yellow-600 italic mt-2">
                    ⚖️ This review has been flagged for constitutional review.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
