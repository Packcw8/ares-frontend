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
    type: "agency",
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

  const [isStatewide, setIsStatewide] = useState(true);

  const [nameQuery, setNameQuery] = useState("");
  const [entitySuggestions, setEntitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (prefillName) {
      setForm((prev) => ({ ...prev, name: prefillName }));
    }
  }, [prefillName]);

  useEffect(() => {
    if (!nameQuery || nameQuery.length < 3) {
      setEntitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await api.get("/ratings/entities/search", {
          params: { q: nameQuery },
        });
        setEntitySuggestions(res.data || []);
        setShowSuggestions(true);
      } catch {
        setEntitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [nameQuery]);

  const categoryOptions = {
    individual: [
      "Judge",
      "Elected Official",
      "Cabinet Member",
      "Agency Director",
      "Other (Senior Official)",
    ],
    agency: [
      "Police Department",
      "Sheriff's Department",
      "CPS / Child Services",
      "Corrections / Jail",
      "State Police",
      "Federal Agency",
      "Other",
    ],
    institution: [
      "Family Court",
      "Juvenile Detention Center",
      "County Jail",
      "State Prison",
      "Government Office",
      "Other",
    ],
  };

  const showCustomCategory = form.category.includes("Other");

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
      county: isStatewide ? "" : form.county,
      category: showCustomCategory ? customCategory : form.category,
    };

    try {
      const res = await api.post("/ratings/entities", payload);

      alert(
        "✅ Entity submitted.\n\nAll new entities are reviewed by an administrator before becoming publicly visible. Please check back later."
      );

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
      <div className="p-4 max-w-xl mx-auto space-y-6 bg-white rounded-lg">
        <h1 className="text-2xl font-bold">Add a Public Entity</h1>

        <div className="text-sm bg-slate-100 text-slate-700 border border-slate-300 rounded p-4 space-y-2">
          <p>
            Use this form to add a <strong>public-facing entity</strong> such as a
            government agency, court, detention facility, or senior public
            official.
          </p>
          <p>
            To protect accuracy and fairness, new submissions are{" "}
            <strong>reviewed by an administrator</strong> before appearing
            publicly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TYPE */}
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value, category: "" })
            }
            className="w-full px-4 py-2 border rounded"
          >
            <option value="agency">Agency</option>
            <option value="institution">Institution</option>
            <option value="individual">Senior Public Official</option>
          </select>

          {/* CATEGORY */}
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select category</option>
            {categoryOptions[form.type].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {showCustomCategory && (
            <input
              type="text"
              placeholder="Specify category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded"
            />
          )}

          {/* STATE */}
          <div className="relative">
            <input
              type="text"
              placeholder="State"
              value={stateQuery}
              onChange={(e) => {
                setStateQuery(e.target.value);
                setShowStateDropdown(true);
                setForm({ ...form, state: "", county: "" });
                setCountyQuery("");
              }}
              required
              className="w-full px-4 py-2 border rounded"
            />

            {showStateDropdown && (
              <div className="absolute z-10 w-full bg-white border rounded shadow">
                {stateOptions.map((s) => (
                  <button
                    key={s.abbr}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, state: s.abbr, county: "" });
                      setStateQuery(s.name);
                      setShowStateDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                  >
                    {s.name} ({s.abbr})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STATEWIDE TOGGLE */}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isStatewide}
              onChange={(e) => {
                setIsStatewide(e.target.checked);
                if (e.target.checked) {
                  setForm({ ...form, county: "" });
                  setCountyQuery("");
                }
              }}
            />
            Statewide / no county (default)
          </label>

          {/* COUNTY */}
          {!isStatewide && (
            <div className="relative">
              <input
                type="text"
                placeholder="County (optional)"
                value={countyQuery}
                onChange={(e) => {
                  setCountyQuery(e.target.value);
                  setShowCountyDropdown(true);
                  setForm({ ...form, county: "" });
                }}
                className="w-full px-4 py-2 border rounded"
              />

              {showCountyDropdown && (
                <div className="absolute z-10 w-full bg-white border rounded shadow">
                  {countyOptions.map((county) => (
                    <button
                      key={county}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, county });
                        setCountyQuery(county);
                        setShowCountyDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                    >
                      {county}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* JURISDICTION */}
          <input
            type="text"
            placeholder="Jurisdiction (optional)"
            value={form.jurisdiction}
            onChange={(e) =>
              setForm({ ...form, jurisdiction: e.target.value })
            }
            className="w-full px-4 py-2 border rounded"
          />

          {/* NAME (LAST) */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Official entity name
            </label>
            <input
              type="text"
              placeholder="Begin typing the official name…"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setNameQuery(e.target.value);
              }}
              required
              className="w-full px-4 py-2 border rounded"
            />

            {showSuggestions && entitySuggestions.length > 0 && (
              <div className="absolute z-20 w-full bg-white border rounded shadow">
                {entitySuggestions.map((ent) => (
                  <button
                    key={ent.id}
                    type="button"
                    onClick={() => {
                      setForm({
                        name: ent.name,
                        type: ent.type,
                        category: ent.category,
                        state: ent.state,
                        county: ent.county,
                        jurisdiction: ent.jurisdiction || "",
                      });
                      setShowSuggestions(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                  >
                    <div className="font-medium">{ent.name}</div>
                    <div className="text-xs text-slate-500">
                      {ent.category} · {ent.state}
                      {ent.county ? `, ${ent.county}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-800 hover:bg-slate-900 px-6 py-2 rounded font-semibold w-full text-white"
          >
            {submitting ? "Submitting…" : "Submit for Review"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
