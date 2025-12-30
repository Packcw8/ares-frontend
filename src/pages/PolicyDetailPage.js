import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import PolicyStatusRequestModal from "../components/PolicyStatusRequestModal";

export default function PolicyDetailPage() {
  const { id } = useParams();
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
        <p className="italic opacity-60">Loading…</p>
      </Layout>
    );
  }

  if (!policy) {
    return (
      <Layout>
        <p className="italic opacity-60">Policy not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">

        <h1 className="text-2xl font-bold text-[#283d63]">
          {policy.title}
        </h1>

        <div className="text-sm text-[#5a4635] space-y-1">
          <p>
            <strong>Jurisdiction:</strong>{" "}
            {policy.jurisdiction_level}
            {policy.state_code ? ` — ${policy.state_code}` : ""}
          </p>

          <p>
            <strong>Governing Body:</strong>{" "}
            {policy.governing_body || "—"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {policy.status_label || "Unverified"}
          </p>
        </div>

        <div className="bg-[#f7f1e1] border border-[#c2a76d] rounded-xl p-4">
          <p className="text-sm text-[#3a2f1b] whitespace-pre-wrap">
            {policy.summary || "No summary available."}
          </p>
        </div>

        {policy.source_url && (
          <a
            href={policy.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-indigo-600 underline"
          >
            Read the full policy →
          </a>
        )}

        <button
          onClick={() => setShowRequest(true)}
          className="px-5 py-3 rounded-xl bg-[#283d63] text-white font-semibold hover:bg-[#1f2f4f]"
        >
          Suggest Status Update
        </button>

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
