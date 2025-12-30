import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";

export default function AdminPolicyQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = async () => {
    try {
      const res = await api.get("/policies/status-requests/pending");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load policy requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const review = async (id, approve) => {
    if (processingId) return;
    setProcessingId(id);

    try {
      await api.post(
        `/policies/status-request/${id}/review`,
        null,
        { params: { approve } }
      );

      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl">

        <h1 className="text-2xl font-bold text-[#283d63]">
          Policy Status Review Queue
        </h1>

        <p className="text-sm text-[#5a4635] max-w-3xl">
          Review proposed status changes to public policies and laws.
          Approved updates immediately become public and are logged permanently.
        </p>

        {loading ? (
          <p className="italic opacity-60">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="italic opacity-60">
            No pending policy status requests.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div
                key={req.id}
                className="
                  rounded-2xl
                  border
                  border-[#c2a76d]
                  bg-[#f7f1e1]
                  p-5
                  shadow-sm
                "
              >
                <div className="space-y-2">

                  <p className="text-sm text-[#5a4635]">
                    <strong>Policy ID:</strong> {req.policy_id}
                  </p>

                  <p className="text-sm text-[#5a4635]">
                    <strong>Requested Status ID:</strong>{" "}
                    {req.requested_status_id}
                  </p>

                  {req.source_link && (
                    <p className="text-sm">
                      <strong>Source:</strong>{" "}
                      <a
                        href={req.source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline"
                      >
                        View source
                      </a>
                    </p>
                  )}

                  {req.note && (
                    <p className="text-sm text-[#3a2f1b] bg-white/60 p-3 rounded">
                      {req.note}
                    </p>
                  )}

                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => review(req.id, true)}
                      disabled={processingId === req.id}
                      className="
                        px-4 py-2 rounded-xl
                        bg-green-600
                        text-white
                        font-semibold
                        hover:bg-green-700
                        disabled:opacity-50
                      "
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => review(req.id, false)}
                      disabled={processingId === req.id}
                      className="
                        px-4 py-2 rounded-xl
                        bg-red-600
                        text-white
                        font-semibold
                        hover:bg-red-700
                        disabled:opacity-50
                      "
                    >
                      Reject
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
