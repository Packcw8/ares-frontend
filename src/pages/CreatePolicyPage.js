import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function CreatePolicyPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    summary: "",
    jurisdiction_level: "federal",
    state_code: "",
    governing_body: "",
    introduced_date: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/policies/submit", {
        title: form.title.trim(),
        summary: form.summary || null,
        jurisdiction_level: form.jurisdiction_level,
        state_code:
          form.jurisdiction_level === "state"
            ? form.state_code.toUpperCase()
            : null,
        governing_body: form.governing_body || null,
        introduced_date: form.introduced_date || null,
      });

      alert(
        "✅ Policy record submitted.\n\nOnce reviewed, it will become publicly visible and available for status tracking and rating."
      );

      navigate("/policies");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to submit policy record. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 max-w-xl mx-auto space-y-6 bg-white rounded-lg">

        {/* HEADER */}
        <h1 className="text-2xl font-bold">
          Add a Policy Record
        </h1>

        {/* INFO BOX */}
        <div className="text-sm bg-slate-100 text-slate-700 border border-slate-300 rounded p-4 space-y-2">
          <p>
            Use this form to add an{" "}
            <strong>existing government policy or piece of legislation</strong>{" "}
            so it can be tracked within ARES.
          </p>
          <p>
            This includes policies that have been{" "}
            <strong>introduced, amended, passed, blocked, or repealed</strong>{" "}
            by Congress or state legislatures.
          </p>
          <p>
            All policy records are{" "}
            <strong>reviewed by an administrator</strong> before becoming
            publicly visible or rateable.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* JURISDICTION */}
          <select
            value={form.jurisdiction_level}
            onChange={(e) =>
              update("jurisdiction_level", e.target.value)
            }
            className="w-full px-4 py-2 border rounded"
          >
            <option value="federal">
              Federal (U.S. Congress / Federal Agencies)
            </option>
            <option value="state">
              State Legislature / Governor
            </option>
          </select>

          {/* STATE */}
          {form.jurisdiction_level === "state" && (
            <input
              type="text"
              placeholder="State code (e.g. WV, CA)"
              maxLength={2}
              value={form.state_code}
              onChange={(e) =>
                update("state_code", e.target.value.toUpperCase())
              }
              required
              className="w-full px-4 py-2 border rounded"
            />
          )}

          {/* GOVERNING BODY */}
          <input
            type="text"
            placeholder="Governing body (e.g. U.S. Senate, WV House of Delegates)"
            value={form.governing_body}
            onChange={(e) =>
              update("governing_body", e.target.value)
            }
            className="w-full px-4 py-2 border rounded"
          />

          {/* TITLE */}
          <input
            type="text"
            placeholder="Official policy or bill title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />

          {/* INTRODUCED DATE */}
          <input
            type="date"
            value={form.introduced_date}
            onChange={(e) =>
              update("introduced_date", e.target.value)
            }
            className="w-full px-4 py-2 border rounded"
          />

          {/* SUMMARY */}
          <textarea
            rows={5}
            placeholder="Brief summary of what the policy does and its current relevance"
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
            className="w-full px-4 py-2 border rounded resize-none"
          />

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-800 hover:bg-slate-900 px-6 py-2 rounded font-semibold w-full text-white"
          >
            {submitting ? "Submitting…" : "Submit Policy Record"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
