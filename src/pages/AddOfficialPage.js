import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function AddOfficialPage() {
  const [form, setForm] = useState({
    name: "",
    type: "individual",
    category: "",
    jurisdiction: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const baseUrl = "https://ares-api-dev-avetckd5ecdgbred.canadacentral-01.azurewebsites.net";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/ratings/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create official");

      const data = await res.json();

      // Redirect to the rating page for this new official
      navigate(`/ratings/${data.id}`);
    } catch (err) {
      alert(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 text-white space-y-6">
        <h1 className="text-2xl font-bold">Add New Official</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded"
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded"
          >
            <option value="individual">Individual</option>
            <option value="agency">Agency</option>
            <option value="institution">Institution</option>
          </select>

          <input
            type="text"
            placeholder="Category (e.g., Judge, CPS)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded"
          />

          <input
            type="text"
            placeholder="Jurisdiction (e.g., WV, Boone County)"
            value={form.jurisdiction}
            onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded"
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            {submitting ? "Submitting..." : "Add Official & Rate"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
