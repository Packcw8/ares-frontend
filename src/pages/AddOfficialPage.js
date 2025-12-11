import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { stateCountyData } from "../data/stateCountyData";
import api from "../services/api"; // ✅ centralized API client

export default function AddOfficialPage() {
  const [form, setForm] = useState({
    name: "",
    type: "individual",
    category: "",
    jurisdiction: "",
    state: "",
    county: "",
  });

  const [customCategory, setCustomCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const categoryOptions = {
    individual: [
      "Judge",
      "Prosecutor",
      "Caseworker",
      "Attorney",
      "Guardian ad Litem",
      "Other",
    ],
    agency: [
      "CPS",
      "Sheriff's Department",
      "Police",
      "DHHR",
      "State Troopers",
      "Other",
    ],
    institution: [
      "Family Court",
      "Juvenile Center",
      "Hospital",
      "Detention Center",
      "School Board",
      "Other",
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      category: form.category === "Other" ? customCategory : form.category,
    };

    try {
      const res = await api.post("/ratings/entities", payload);
      navigate(`/ratings/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.detail ||
          "Failed to create official. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const states = Object.keys(stateCountyData);
  const counties = form.state ? stateCountyData[form.state] : [];
  const showCustomCategory = form.category === "Other";

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
            className="w-full px-4 py-2 bg-gray-900 rounded"
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
                category: "",
              })
            }
            className="w-full px-4 py-2 bg-gray-900 rounded"
          >
            <option value="individual">Individual</option>
            <option value="agency">Agency</option>
            <option value="institution">Institution</option>
          </select>

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="w-full px-4 py-2 bg-gray-900 rounded"
          >
            <option value="">Select Category</option>
            {categoryOptions[form.type].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {showCustomCategory && (
            <input
              type="text"
              placeholder="Enter custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-900 rounded"
            />
          )}

          <select
            value={form.state}
            onChange={(e) =>
              setForm({ ...form, state: e.target.value, county: "" })
            }
            required
            className="w-full px-4 py-2 bg-gray-900 rounded"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={form.county}
            onChange={(e) => setForm({ ...form, county: e.target.value })}
            required
            disabled={!form.state}
            className="w-full px-4 py-2 bg-gray-900 rounded"
          >
            <option value="">Select County</option>
            {counties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Jurisdiction (optional)"
            value={form.jurisdiction}
            onChange={(e) =>
              setForm({ ...form, jurisdiction: e.target.value })
            }
            className="w-full px-4 py-2 bg-gray-900 rounded"
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold"
          >
            {submitting ? "Submitting..." : "Add Official & Rate"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
