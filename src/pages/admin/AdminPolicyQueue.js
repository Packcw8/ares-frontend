import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function AdminPolicyManager() {
  const [activeTab, setActiveTab] = useState("pending_policies");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [pendingPolicies, setPendingPolicies] = useState([]);
  const [approvedPolicies, setApprovedPolicies] = useState([]);
  const [statusRequests, setStatusRequests] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);

      const [pendingRes, approvedRes, statusRes] = await Promise.all([
        api.get("/policies/pending"),
        api.get("/policies"),
        api.get("/policies/status-requests/pending"),
      ]);

      setPendingPolicies(pendingRes.data || []);
      setApprovedPolicies(approvedRes.data || []);
      setStatusRequests(statusRes.data || []);
    } catch (err) {
      console.error("Failed to load policy admin data", err);
      alert("Failed to load policy admin data");
    } finally {
      setLoading(false);
    }
  }

  /* ===================== ACTIONS ===================== */

  async function approvePolicy(id) {
    if (!window.confirm("Approve and publish this policy?")) return;
    setProcessingId(id);

    try {
      await api.post(`/policies/${id}/approve`);
      loadAll();
    } catch {
      alert("Failed to approve policy");
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectPolicy(id) {
    if (!window.confirm("Reject this policy submission?")) return;
    setProcessingId(id);

    try {
      await api.post(`/policies/${id}/reject`);
      loadAll();
    } catch {
      alert("Failed to reject policy");
    } finally {
      setProcessingId(null);
    }
  }

  async function reviewStatusRequest(id, approve) {
    setProcessingId(id);

    try {
      await api.post(
        `/policies/status-request/${id}/review`,
        null,
        { params: { approve } }
      );
      loadAll();
    } catch {
      alert("Failed to process status request");
    } finally {
      setProcessingId(null);
    }
  }

  /* ===================== RENDER HELPERS ===================== */

  function renderPolicyCard(policy, isPending = false) {
    return (
      <div
        key={policy.id}
        className="constitution-card"
      >
        <h3 className="text-lg font-bold">
          {policy.title}
        </h3>

        <p className="text-sm text-[#5a4635] mt-1">
          {policy.summary || "No summary provided."}
        </p>

        <p className="text-xs mt-2 opacity-70">
          {policy.jurisdiction_level.toUpperCase()}
          {policy.state_code ? ` · ${policy.state_code}` : ""}
          {policy.governing_body ? ` · ${policy.governing_body}` : ""}
        </p>

        {isPending && (
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => approvePolicy(policy.id)}
              disabled={processingId === policy.id}
              className="constitution-btn bg-green-700 hover:bg-green-800"
            >
              ✅ Approve
            </button>

            <button
              onClick={() => rejectPolicy(policy.id)}
              disabled={processingId === policy.id}
              className="constitution-btn bg-red-700 hover:bg-red-800"
            >
              ❌ Reject
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderStatusRequest(req) {
    return (
      <div
        key={req.id}
        className="constitution-card"
      >
        <p className="text-sm">
          <strong>Policy ID:</strong> {req.policy_id}
        </p>

        <p className="text-sm">
          <strong>Requested Status ID:</strong>{" "}
          {req.requested_status_id}
        </p>

        {req.source_link && (
          <p className="text-sm mt-2">
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
          <p className="text-sm mt-2 bg-white/60 p-3 rounded">
            {req.note}
          </p>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={() => reviewStatusRequest(req.id, true)}
            disabled={processingId === req.id}
            className="constitution-btn bg-green-700 hover:bg-green-800"
          >
            Approve
          </button>

          <button
            onClick={() => reviewStatusRequest(req.id, false)}
            disabled={processingId === req.id}
            className="constitution-btn bg-red-700 hover:bg-red-800"
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  /* ===================== UI ===================== */

  return (
    <AdminLayout>
      {/* Header */}
      <section className="constitution-card">
        <h2 className="text-2xl font-bold mb-2">
          📜 Policy Manager
        </h2>
        <p className="text-sm text-[#5a4635]">
          Review, approve, and manage public policy records and their lifecycle.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          ["pending_policies", "Pending Policies"],
          ["approved_policies", "Approved Policies"],
          ["status_requests", "Status Requests"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`constitution-btn ${
              activeTab === key
                ? "bg-[#283d63] text-white"
                : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="italic text-center text-[#5a4635]">
          Loading policies…
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="space-y-4">
          {activeTab === "pending_policies" &&
            (pendingPolicies.length === 0 ? (
              <div className="constitution-card italic text-center">
                No pending policy submissions.
              </div>
            ) : (
              pendingPolicies.map((p) =>
                renderPolicyCard(p, true)
              )
            ))}

          {activeTab === "approved_policies" &&
            (approvedPolicies.length === 0 ? (
              <div className="constitution-card italic text-center">
                No approved policies.
              </div>
            ) : (
              approvedPolicies.map((p) =>
                renderPolicyCard(p, false)
              )
            ))}

          {activeTab === "status_requests" &&
            (statusRequests.length === 0 ? (
              <div className="constitution-card italic text-center">
                No pending status requests.
              </div>
            ) : (
              statusRequests.map(renderStatusRequest)
            ))}
        </div>
      )}
    </AdminLayout>
  );
}
