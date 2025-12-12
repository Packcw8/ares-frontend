import { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { stateCountyData } from "../data/stateCountyData";

export default function VaultUpload() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [entityId, setEntityId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [entities, setEntities] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [state, setState] = useState("");
  const [county, setCounty] = useState("");

  useEffect(() => {
    api.get("/ratings/entities").then((res) => setEntities(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("location", location);
      formData.append("entity_id", entityId || "");
      formData.append("public", isPublic);
      formData.append("anonymous", isAnonymous);

      await api.post("/vault/upload", formData);
      alert("Upload successful");
      window.location.href = "/vault";
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const stateOptions = useMemo(() => {
    return Object.entries(stateCountyData || {}).map(([abbr, data]) => ({
      abbr,
      name: data.name,
    }));
  }, []);

  const countyOptions = useMemo(() => {
    if (!state) return [];
    return Array.isArray(stateCountyData[state]?.counties)
      ? stateCountyData[state].counties
      : [];
  }, [state]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <h1 className="text-2xl font-bold text-[#283d63]">
          Upload Evidence to Vault
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* FILE */}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border p-2 rounded"
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Describe what this evidence shows…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-3 rounded"
            rows={4}
          />

          {/* TAGS */}
          <input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border p-2 rounded"
          />

          {/* ENTITY */}
          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Link to entity (optional)</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          {/* STATE */}
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setCounty("");
            }}
            className="w-full border p-2 rounded"
          >
            <option value="">Select state</option>
            {stateOptions.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>

          {/* COUNTY — FIXED */}
          {state && (
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select county</option>
              {countyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* LOCATION */}
          <input
            placeholder="Specific location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-2 rounded"
          />

          {/* VISIBILITY */}
          <div className="flex gap-4 text-sm">
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />{" "}
              Public
            </label>

            <label>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
              />{" "}
              Anonymous
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={uploading}
            className="bg-[#283d63] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1d2c49]"
          >
            {uploading ? "Uploading…" : "Upload Evidence"}
          </button>

        </form>
      </div>
    </Layout>
  );
}
