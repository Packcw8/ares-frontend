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

  // Optional state/county (used to auto-compose the optional "location" string)
  const [state, setState] = useState("");
  const [county, setCounty] = useState("");

  // Entity search
  const [entitySearch, setEntitySearch] = useState("");

  useEffect(() => {
    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data))
      .catch((err) => console.error("Failed to load entities", err));
  }, []);

  // Auto-compose location from state/county (still editable by the user)
  useEffect(() => {
    if (state && county) setLocation(`${county}, ${state}`);
    else if (state) setLocation(state);
  }, [state, county]);

  const filteredEntities = useMemo(() => {
    const q = entitySearch.trim().toLowerCase();
    if (!q) return entities;
    return entities.filter((e) =>
      `${e.name} ${e.state || ""} ${e.county || ""}`.toLowerCase().includes(q)
    );
  }, [entitySearch, entities]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !entityId) {
      alert("File and entity are required");
      return;
    }

    try {
      setUploading(true);

      // 1) Get presigned upload URL
      const uploadRes = await api.post("/vault/upload-url", {
        filename: file.name,
        content_type: file.type || "application/octet-stream",
      });

      const { upload_url, file_url } = uploadRes.data;

      // 2) Upload file directly to Backblaze
      const put = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!put.ok) throw new Error("Direct upload to storage failed.");

      // 3) Save metadata
      await api.post("/vault", {
        blob_url: file_url,
        description,
        tags,
        location,
        is_public: isPublic,
        is_anonymous: isAnonymous,
        entity_id: Number(entityId),
      });

      alert("Added to Vault");

      // Reset
      setFile(null);
      setDescription("");
      setTags("");
      setLocation("");
      setEntityId("");
      setState("");
      setCounty("");
      setIsAnonymous(false);
      setIsPublic(true);
      setEntitySearch("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 text-white">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-wide text-gray-900">Record Evidence</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-xl mx-auto">
            Contribute a piece of evidence to the Vault. Start with the file — everything else is optional and can be added later.
          </p>
        </div>

        {/* Evidence + Entity */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Evidence drop zone */}
          <div className="rounded-3xl border border-amber-200/40 bg-gradient-to-b from-[#f7f1e1] to-[#efe6cf] p-12 text-center shadow-md transition">
            <label className="cursor-pointer block">
              <div className="text-5xl mb-3">📎</div>
              <p className="font-medium">Drop evidence here or click to select</p>
              <p className="text-xs text-gray-600 mt-1">Video, audio, image, or document</p>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            {file && (
              <p className="mt-4 text-sm text-gray-700">
                Selected: <span className="font-semibold">{file.name}</span>
              </p>
            )}
          </div>

          {/* Entity section */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Who is this evidence about?</p>
            <input
              placeholder="Search entity"
              value={entitySearch}
              onChange={(e) => setEntitySearch(e.target.value)}
              className="w-full bg-[#fdf9ef] text-gray-900 p-3 rounded-xl border border-amber-200/40"
            />

            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full bg-[#fdf9ef] text-gray-900 p-3 rounded-xl border border-amber-200/40"
            >
              <option value="">Select entity *</option>
              {filteredEntities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} {e.state ? `(${e.state})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Optional details */}
          <div className="rounded-3xl border border-amber-200/40 bg-gradient-to-b from-[#f7f1e1] to-[#efe6cf] p-8 space-y-6 shadow-sm">
            <p className="text-sm font-medium text-gray-700">Additional context (optional)</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCounty("");
                }}
                className="bg-[#fdf9ef] text-gray-900 p-3 rounded-xl border border-amber-200/40"
              >
                <option value="">State (optional)</option>
                {Object.keys(stateCountyData).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={county}
                disabled={!state}
                onChange={(e) => setCounty(e.target.value)}
                className="bg-[#fdf9ef] text-gray-900 p-3 rounded-xl border border-amber-200/40"
              >
                <option value="">
                  {state ? "County (optional)" : "Select state first"}
                </option>
                {state &&
                  stateCountyData[state].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            {/* Location is optional and editable */}
            <input
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#fdf9ef] text-gray-900 p-3 rounded-xl border border-amber-200/40"
            />

            <textarea
              placeholder="Context (optional) — what does this show?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#fdf9ef] text-gray-900 p-3 rounded-xl border border-amber-200/40"
              rows={3}
            />

            <input
              placeholder="Tags (optional)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[#fdf9ef] text-gray-900 p-3 rounded-xl border border-amber-200/40"
            />

            {/* Visibility / identity (kept, but subdued) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic((v) => !v)}
                />
                Public
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous((v) => !v)}
                />
                Anonymous
              </label>
            </div>
          </div>

          {/* Primary action */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={uploading}
              aria-label="Add to Vault"
              className="w-16 h-16 rounded-full flex items-center justify-center
                         text-3xl font-bold
                         bg-[#cfa64a] text-gray-900
                         hover:bg-[#b8943f]
                         shadow-lg shadow-yellow-300/20
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "…" : "+"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
