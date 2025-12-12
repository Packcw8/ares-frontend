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
     ENTITY SEARCH FILTER
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

      // Reset
      setFile(null);
      setDescription("");
      setTags("");
      setLocation("");
      setEntityId("");
      setEntitySearch("");
      setState("");
      setCounty("");
      setIsAnonymous(false);
      setIsPublic(true);
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
              <p className="text-xs opacity-60 mt-1">
                Video, audio, image, or document
              </p>
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
              placeholder="Search entity (name, state, county…)"
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
                        setEntitySearch(
                          `${e.name}${e.state ? ` (${e.state})` : ""}`
                        );
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

                {/* ADD ENTITY CTA */}
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

            {entityId && (
              <p className="text-xs text-green-700 font-medium">
                ✓ Entity selected
              </p>
            )}
          </div>

          {/* OPTIONAL DETAILS */}
          <div className="rounded-3xl border bg-[#f7f1e1] p-8 space-y-6">
            <p className="text-sm font-medium">Additional context (optional)</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCounty("");
                }}
                className="p-3 rounded-xl border bg-[#fdf9ef]"
              >
                <option value="">State</option>
                {Object.keys(stateCountyData).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={county}
                disabled={!state}
                onChange={(e) => setCounty(e.target.value)}
                className="p-3 rounded-xl border bg-[#fdf9ef]"
              >
                <option value="">
                  {state ? "County" : "Select state first"}
                </option>
                {state &&
                  stateCountyData[state].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>
            </div>

            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
            />

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

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic((v) => !v)}
                />
                Public
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous((v) => !v)}
                />
                Anonymous
              </label>
            </div>
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
