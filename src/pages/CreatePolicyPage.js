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

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const endpoint = "/policies/submit"; // default user flow

      await api.post(endpoint, {
        ...form,
        state_code:
          form.jurisdiction_level === "state"
            ? form.state_code
            : null,
        introduced_date: form.introduced_date || null,
      });

      navigate("/policies");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to submit policy"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-[#283d63]">
          Propose a Policy
        </h1>

        <p className="text-sm text-[#5a4635]">
          Policies submitted by users are reviewed before becoming
          publicly rateable.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-xl border"
        >
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="font-semibold text-sm">
              Policy Title
            </label>
            <input
              required
              value={form.title}
              onChange={e => update("title", e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">
              Summary
            </label>
            <textarea
              value={form.summary}
              onChange={e => update("summary", e.target.value)}
              rows={5}
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-sm">
                Jurisdiction Level
              </label>
              <select
                value={form.jurisdiction_level}
                onChange={e =>
                  update("jurisdiction_level", e.target.value)
                }
                className="w-full mt-1 border rounded px-3 py-2"
              >
                <option value="federal">Federal</option>
                <option value="state">State</option>
              </select>
            </div>

            {form.jurisdiction_level === "state" && (
              <div>
                <label className="font-semibold text-sm">
                  State Code
                </label>
                <input
                  maxLength={2}
                  value={form.state_code}
                  onChange={e =>
                    update(
                      "state_code",
                      e.target.value.toUpperCase()
                    )
                  }
                  className="w-full mt-1 border rounded px-3 py-2"
                />
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-sm">
              Governing Body
            </label>
            <input
              value={form.governing_body}
              onChange={e =>
                update("governing_body", e.target.value)
              }
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">
              Introduced Date
            </label>
            <input
              type="date"
              value={form.introduced_date}
              onChange={e =>
                update("introduced_date", e.target.value)
              }
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>

          <button
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-[#283d63] text-white font-semibold hover:bg-[#1f2f4f]"
          >
            {submitting ? "Submitting…" : "Submit Policy"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
