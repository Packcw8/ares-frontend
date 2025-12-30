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
      .then((res) => setPolicy(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 italic text-gray-500">Loading policy…</div>
      </Layout>
    );
  }

  if (!policy) {
    return (
      <Layout>
        <div className="p-6 italic text-gray-500">Policy not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 pb-24 space-y-8 text-[#1e1e1e]">

        {/* TOP BAR */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => navigate("/policies")}
            className="
              flex items-center gap-2
              text-sm font-semibold
              text-[#283d63]
              hover:text-[#1c2b4a]
            "
          >
            <span className="text-lg">←</span>
            Policies
          </button>

          <ShareButton
            url={`/policies/${policy.id}`}
            label="Share policy"
          />
        </div>

        {/* POLICY HEADER CARD */}
        <div className="
          bg-white
          border border-[#e5dcc3]
          rounded-2xl
          shadow
          p-8
          space-y-6
        ">

          {/* TITLE */}
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              {policy.title}
            </h1>

            <p className="mt-2 text-sm uppercase tracking-wide text-gray-600">
              {policy.jurisdiction_level}
              {policy.state_code ? ` · ${policy.state_code}` : ""}
              {policy.governing_body ? ` · ${policy.governing_body}` : ""}
            </p>
          </div>

          {/* SUMMARY */}
          <div className="
            bg-[#fdf7e3]
            border border-[#c2a76d]
            rounded-xl
            p-5
          ">
            <p className="text-[15px] leading-relaxed text-[#3a2f1b] whitespace-pre-wrap">
              {policy.summary || "No summary has been provided for this policy."}
            </p>
          </div>

          {/* ACTION BAR */}
          <div className="
            flex flex-wrap items-center gap-4
            pt-2
          ">

            {/* ✅ CORRECT RATING LOGIC */}
            {policy.rated_entity_id ? (
              <button
                onClick={() =>
                  navigate(`/ratings/${policy.rated_entity_id}/rate`)
                }
                className="
                  bg-blue-700 hover:bg-blue-800
                  text-white
                  px-6 py-2.5
                  rounded-lg
                  font-semibold
                  shadow-sm
                "
              >
                Rate This Policy
              </button>
            ) : (
              <span className="italic text-sm text-gray-500">
                Not yet available for public rating.
              </span>
            )}

            <button
              onClick={() => setShowRequest(true)}
              className="
                bg-[#283d63] hover:bg-[#1f2f4f]
                text-white
                px-6 py-2.5
                rounded-lg
                font-semibold
                shadow-sm
              "
            >
              Suggest Status Update
            </button>
          </div>
        </div>

        {/* STATUS REQUEST MODAL */}
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
