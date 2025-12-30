import { useState } from "react";
import api from "../services/api";

export default function PolicyStatusRequestModal({ policyId, onClose }) {
  const [statusId, setStatusId] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!statusId) return alert("Select a status");

    setSubmitting(true);
    try {
      await api.post("/policies/status-request", {
        policy_id: policyId,
        requested_status_id: Number(statusId),
        source_link: source,
        note,
      });

      alert(
        "✅ Status update submitted.\n\nAll updates are reviewed before appearing publicly."
      );
      onClose();
    } catch {
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">

        <h2 className="text-lg font-bold text-[#283d63]">
          Suggest Status Update
        </h2>

        <select
          value={statusId}
          onChange={e => setStatusId(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select new status</option>
          <option value="1">Proposed</option>
          <option value="2">In Committee</option>
          <option value="3">Floor Vote</option>
          <option value="4">Passed</option>
          <option value="5">Vetoed</option>
          <option value="6">Repealed</option>
          <option value="7">Struck Down</option>
        </select>

        <input
          type="text"
          placeholder="Source link (optional)"
          value={source}
          onChange={e => setSource(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />

        <textarea
          placeholder="Notes (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border rounded"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 rounded bg-[#283d63] text-white font-semibold"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
