import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { stateCountyData } from "../data/stateCountyData";
import api from "../services/api";

export default function AddOfficialPage() {
  const navigate = useNavigate();

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

  // 🔹 typing state
  const [stateQuery, setStateQuery] = useState("");
  const [countyQuery, setCountyQuery] = useState("");

  // 🔹 dropdown control (FIX)
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);

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

  const showCustomCategory = form.category === "Other";

  // 🔹 state list
  const stateOptions = useMemo(() => {
    return Object.entries(stateCountyData)
      .map(([abbr, data]) => ({
        abbr,
        name: data.name,
      }))
      .filter(
        (s) =>
          s.name.toLowerCase().includes(stateQuery.toLowerCase()) ||
          s.abbr.toLowerCase().includes(stateQuery.toLowerCase())
      );
  }, [stateQuery]);

  // 🔹 county list (scoped to state)
  const countyOptions = useMemo(() => {
    if (!form.state) return [];
    return stateCountyData[form.state].counties.filter((county) =>
      county.toLowerCase().includes(countyQuery.toLowerCase())
    );
  }, [form.state, countyQuery]);

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

  return (
    <Layout>
      <div className="p-4 text-white space-y-6 max-w-xl mx-auto">
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
              setForm({ ...form, type: e.target.value, category: "" })
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
            {categoryOptions[form.type].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
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

          {/* 🔹 STATE TYPE-AHEAD */}
          <div className="relative">
            <input
              type="text"
              placeholder="Type state (e.g. West Virginia)"
              value={stateQuery}
              onChange={(e) => {
                setStateQuery(e.target.value);
                setShowStateDropdown(true);
                setForm({ ...form, state: "", county: "" });
                setCountyQuery("");
                setShowCountyDropdown(false);
              }}
              className="w-full px-4 py-2 bg-gray-900 rounded"
              required
            />

            {showStateDropdown && stateOptions.length > 0 && (
              <div className="absolute z-10 w-full bg-gray-800 rounded mt-1 max-h-48 overflow-y-auto">
                {stateOptions.map((s) => (
                  <button
                    type="button"
                    key={s.abbr}
                    onClick={() => {
                      setForm({ ...form, state: s.abbr, county: "" });
                      setStateQuery(s.name);
                      setShowStateDropdown(false); // ✅ FIX
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    {s.name} ({s.abbr})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🔹 COUNTY TYPE-AHEAD */}
          <div className="relative">
            <input
              type="text"
              placeholder={form.state ? "Type county" : "Select state first"}
              value={countyQuery}
              onChange={(e) => {
                setCountyQuery(e.target.value);
                setShowCountyDropdown(true);
                setForm({ ...form, county: "" });
              }}
              disabled={!form.state}
              required
              className="w-full px-4 py-2 bg-gray-900 rounded disabled:opacity-50"
            />

            {showCountyDropdown &&
              countyQuery &&
              countyOptions.length > 0 && (
                <div className="absolute z-10 w-full bg-gray-800 rounded mt-1 max-h-48 overflow-y-auto">
                  {countyOptions.map((county) => (
                    <button
                      type="button"
                      key={county}
                      onClick={() => {
                        setForm({ ...form, county });
                        setCountyQuery(county);
                        setShowCountyDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                    >
                      {county}
                    </button>
                  ))}
                </div>
              )}
          </div>

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
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold w-full"
          >
            {submitting ? "Submitting..." : "Add Official & Rate"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
