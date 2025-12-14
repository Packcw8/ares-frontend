import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { stateCountyData } from "../data/stateCountyData";
import api from "../services/api";

export default function AddOfficialPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get("returnTo");
  const prefillName = searchParams.get("name");

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

  const [stateQuery, setStateQuery] = useState("");
  const [countyQuery, setCountyQuery] = useState("");

  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);

  // Prefill name if provided
  useEffect(() => {
    if (prefillName) {
      setForm((prev) => ({ ...prev, name: prefillName }));
    }
  }, [prefillName]);

  const categoryOptions = {
    individual: [
      "Judge",
      "Prosecutor",
      "Caseworker",
      "Attorney",
      "Guardian ad Litem",
      "Politician",
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

  const stateOptions = useMemo(() => {
    return Object.entries(stateCountyData)
      .map(([abbr, data]) => ({ abbr, name: data.name }))
      .filter(
        (s) =>
          s.name.toLowerCase().includes(stateQuery.toLowerCase()) ||
          s.abbr.toLowerCase().includes(stateQuery.toLowerCase())
      );
  }, [stateQuery]);

  const countyOptions = useMemo(() => {
    if (!form.state || form.state === "DC") return [];
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

      if (res.data.approval_status === "under_review") {
        alert(
          "✅ Entity submitted successfully.\n\n" +
            "This entity is under admin review and will be visible once approved."
        );
      }

      if (returnTo) {
        navigate(`${returnTo}?entityId=${res.data.id}`);
      } else {
        navigate(`/ratings/${res.data.id}`);
      }
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Failed to create entity. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Add New Entity</h1>

        <div className="text-sm bg-yellow-100 text-yellow-900 border border-yellow-300 rounded p-3">
          Newly created entities are reviewed by an administrator before becoming public.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-4 py-2 bg-gray-900 text-white rounded"
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value, category: "" })
            }
            className="w-full px-4 py-2 bg-gray-900 text-white rounded"
          >
            <option value="individual">Individual</option>
            <option value="agency">Agency</option>
            <option value="institution">Institution</option>
          </select>

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="w-full px-4 py-2 bg-gray-900 text-white rounded"
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
              placeholder="Custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-900 text-white rounded"
            />
          )}

          {/* STATE */}
          <div className="relative">
            <input
              type="text"
              placeholder="Type state"
              value={stateQuery}
              onChange={(e) => {
                setStateQuery(e.target.value);
                setShowStateDropdown(true);
                setForm({ ...form, state: "", county: "" });
                setCountyQuery("");
                setShowCountyDropdown(false);
              }}
              required
              className="w-full px-4 py-2 bg-gray-900 text-white rounded"
            />

            {showStateDropdown && stateOptions.length > 0 && (
              <div className="absolute z-10 w-full bg-gray-800 rounded mt-1">
                {stateOptions.map((s) => (
                  <button
                    type="button"
                    key={s.abbr}
                    onClick={() => {
                      if (s.abbr === "DC") {
                        setForm({
                          ...form,
                          state: "DC",
                          county: "Washington, DC",
                        });
                        setCountyQuery("Washington, DC");
                        setShowCountyDropdown(false);
                      } else {
                        setForm({
                          ...form,
                          state: s.abbr,
                          county: "",
                        });
                        setCountyQuery("");
                      }

                      setStateQuery(s.name);
                      setShowStateDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
                  >
                    {s.name} ({s.abbr})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COUNTY */}
          <div className="relative">
            <input
              type="text"
              placeholder={
                form.state === "DC"
                  ? "Washington, DC"
                  : form.state
                  ? "Type county"
                  : "Select state first"
              }
              value={countyQuery}
              onChange={(e) => {
                setCountyQuery(e.target.value);
                setShowCountyDropdown(true);
                setForm({ ...form, county: "" });
              }}
              disabled={!form.state || form.state === "DC"}
              required
              className="w-full px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50"
            />

            {showCountyDropdown &&
              countyQuery &&
              countyOptions.length > 0 && (
                <div className="absolute z-10 w-full bg-gray-800 rounded mt-1">
                  {countyOptions.map((county) => (
                    <button
                      type="button"
                      key={county}
                      onClick={() => {
                        setForm({ ...form, county });
                        setCountyQuery(county);
                        setShowCountyDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
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
            className="w-full px-4 py-2 bg-gray-900 text-white rounded"
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold w-full text-white"
          >
            {submitting ? "Submitting…" : "Create Entity"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
