import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import ShareButton from "../components/ShareButton";
import PolicyStatusRequestModal from "../components/PolicyStatusRequestModal";

export default function PolicyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    api
      .get(`/policies/${id}`)
      .then(res => setPolicy(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="p-4 italic opacity-60">Loading…</div>
      </Layout>
    );
  }

  if (!policy) {
    return (
      <Layout>
        <div className="p-4 italic opacity-60">Policy not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto px-4 pb-24">

        {/* HEADER BAR */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/policies")}
            className="flex items-center gap-2 text-sm font-semibold text-[#283d63]"
          >
            <span className="text-lg">←</span>
            Policies
          </button>

          <ShareButton url={`/policies/${policy.id}`} label="Share policy" />
        </div>

        {/* POLICY CARD */}
        <div className="bg-white rounded-2xl border border-[#e5dcc3] p-6 shadow">

          <h1 className="text-3xl font-bold mb-1">
            {policy.title}
          </h1>

          <p className="text-sm text-gray-600 mb-4">
            {policy.jurisdiction_level.toUpperCase()}
            {policy.state_code ? ` · ${policy.state_code}` : ""}
            {policy.governing_body ? ` · ${policy.governing_body}` : ""}
          </p>

          <div className="bg-[#fdf7e3] border border-[#c2a76d] rounded-lg p-4">
            <p className="text-sm text-[#3a2f1b] whitespace-pre-wrap">
              {policy.summary || "No summary available."}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-wrap gap-3">
            {policy.rated_entity_id ? (
              <button
                onClick={() =>
                  navigate(`/ratings/${policy.rated_entity_id}/rate`)
                }
                className="
                  bg-blue-700 hover:bg-blue-800
                  text-white
                  px-5 py-2
                  rounded-lg
                  font-semibold
                "
              >
                Rate This Policy
              </button>
            ) : (
              <span className="italic text-sm opacity-60">
                Not yet available for public rating.
              </span>
            )}

            <button
              onClick={() => setShowRequest(true)}
              className="
                bg-[#283d63] hover:bg-[#1f2f4f]
                text-white
                px-5 py-2
                rounded-lg
                font-semibold
              "
            >
              Suggest Status Update
            </button>
          </div>
        </div>

        {showRequest && (
          <PolicyStatusRequestModal
            policyId={policy.id}
            onClose={() => setShowRequest(false)}
          />
        )}
      </div>
    </Layout>
  );
}
