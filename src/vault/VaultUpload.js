import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { stateCountyData } from "../data/stateCountyData";

export default function VaultUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [entityId, setEntityId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [entities, setEntities] = useState([]);
  const [entitySearch, setEntitySearch] = useState("");

  // 🔥 Dynamic state / county typing
  const [stateQuery, setStateQuery] = useState("");
  const [countyQuery, setCountyQuery] = useState("");
  const [state, setState] = useState("");
  const [county, setCounty] = useState("");

  /* =========================
     LOAD ENTITIES
     ========================= */
  useEffect(() => {
    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data || []))
      .catch(() => console.error("Failed to load entities"));
  }, []);

  /* =========================
     AUTO LOCATION
     ========================= */
  useEffect(() => {
    if (state && county) setLocation(`${county}, ${state}`);
    else if (state) setLocation(state);
  }, [state, county]);

  /* =========================
     ENTITY SEARCH
     ========================= */
  const filteredEntities = useMemo(() => {
    const q = entitySearch.trim().toLowerCase();
    if (!q) return [];
    return entities.filter((e) =>
      `${e.name} ${e.state || ""} ${e.county || ""} ${e.type || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [entitySearch, entities]);

  /* =========================
     STATE SEARCH (SAFE)
     ========================= */
  const stateOptions = useMemo(() => {
    if (!stateQuery) return [];
    return Object.entries(stateCountyData)
      .map(([abbr, data]) => ({ abbr, name: data.name }))
      .filter((s) =>
        s.name.toLowerCase().includes(stateQuery.toLowerCase())
      );
  }, [stateQuery]);

  /* =========================
     COUNTY SEARCH (SAFE)
     ========================= */
  const countyOptions = useMemo(() => {
    if (!state || !countyQuery) return [];
    return Array.isArray(stateCountyData[state]?.counties)
      ? stateCountyData[state].counties.filter((c) =>
          c.toLowerCase().includes(countyQuery.toLowerCase())
        )
      : [];
  }, [state, countyQuery]);

  /* =========================
     SUBMIT
     ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !entityId) {
      alert("File and entity are required");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity_id", entityId);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("location", location);
      formData.append("is_public", isPublic);
      formData.append("is_anonymous", isAnonymous);

      await api.post("/vault", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Added to Vault");
      navigate("/vault");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-wide">
            Record Evidence
          </h1>
          <p className="text-sm opacity-70 mt-2 max-w-xl mx-auto">
            Upload evidence tied to an official, agency, or institution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* FILE */}
          <div className="rounded-3xl border bg-[#f7f1e1] p-12 text-center shadow-md">
            <label className="cursor-pointer block">
              <div className="text-5xl mb-3">📎</div>
              <p className="font-medium">Drop evidence here or click to select</p>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            {file && (
              <p className="mt-4 text-sm opacity-80">
                Selected: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          {/* ENTITY SEARCH */}
          <div className="space-y-3 relative">
            <p className="text-sm font-medium">
              Who is this evidence about? <span className="text-red-600">*</span>
            </p>

            <input
              placeholder="Search entity (name, state, county…)”
              value={entitySearch}
              onChange={(e) => {
                setEntitySearch(e.target.value);
                setEntityId("");
              }}
              className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
            />

            {entitySearch && (
              <div className="absolute z-30 w-full bg-[#fdf9ef] border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {filteredEntities.length > 0 ? (
                  filteredEntities.slice(0, 8).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setEntityId(e.id);
                        setEntitySearch(`${e.name}${e.state ? ` (${e.state})` : ""}`);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#efe6cf]"
                    >
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs opacity-60">
                        {e.type} • {e.county || "—"}, {e.state || ""}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm opacity-70">
                    No matching entity found.
                  </div>
                )}

                <div className="border-t px-4 py-3 bg-[#f7f1e1]">
                  <button
                    type="button"
                    onClick={() => navigate("/ratings/new")}
                    className="text-sm font-medium text-[#8b1e3f] hover:underline"
                  >
                    Don’t see your entity? Add them →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STATE + COUNTY (DYNAMIC) */}
          <div className="rounded-3xl border bg-[#f7f1e1] p-8 space-y-6">

            {/* STATE */}
            <div className="relative">
              <input
                placeholder="State"
                value={stateQuery}
                onChange={(e) => {
                  setStateQuery(e.target.value);
                  setState("");
                  setCounty("");
                  setCountyQuery("");
                }}
                className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
              />

              {stateQuery && (
                <div className="absolute z-20 w-full bg-[#fdf9ef] border rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  {stateOptions.map((s) => (
                    <button
                      key={s.abbr}
                      type="button"
                      onClick={() => {
                        setState(s.abbr);
                        setStateQuery(s.name);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#efe6cf]"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COUNTY */}
            {state && (
              <div className="relative">
                <input
                  placeholder="County"
                  value={countyQuery}
                  onChange={(e) => setCountyQuery(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
                />

                {countyQuery && (
                  <div className="absolute z-20 w-full bg-[#fdf9ef] border rounded-xl shadow-lg max-h-56 overflow-y-auto">
                    {countyOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCounty(c);
                          setCountyQuery(c);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#efe6cf]"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <textarea
              placeholder="What does this evidence show?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
            />

            <input
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
            />
          </div>

          {/* SUBMIT */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={uploading}
              className="w-16 h-16 rounded-full bg-[#cfa64a] hover:bg-[#b8943f] text-3xl font-bold shadow-lg"
            >
              {uploading ? "…" : "+"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
