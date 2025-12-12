// Editable VaultUpload.js
// We will refine this file together step by step

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
  const [entitySearch, setEntitySearch] = useState("");

  useEffect(() => {
    api.get("/ratings/entities").then((res) => setEntities(res.data));
  }, []);

  useEffect(() => {
    if (state && county) setLocation(`${county}, ${state}`);
    else if (state) setLocation(state);
  }, [state, county]);

  const filteredEntities = useMemo(() => {
    const q = entitySearch.toLowerCase();
    if (!q) return entities;
    return entities.filter((e) =>
      `${e.name} ${e.state ?? ""} ${e.county ?? ""}`.toLowerCase().includes(q)
    );
  }, [entitySearch, entities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !entityId) return alert("File and entity are required");

    try {
      setUploading(true);

      const uploadRes = await api.post("/vault/upload-url", {
        filename: file.name,
        content_type: file.type || "application/octet-stream",
      });

      const { upload_url, file_url } = uploadRes.data;

      const put = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!put.ok) throw new Error("Upload failed");

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
      setFile(null);
      setDescription("");
      setTags("");
      setLocation("");
      setEntityId("");
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
      <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
        <h1 className="text-3xl font-extrabold">Add Evidence to the Vault</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <input
            placeholder="Search entity"
            value={entitySearch}
            onChange={(e) => setEntitySearch(e.target.value)}
            className="w-full bg-gray-900 p-2 rounded"
          />

          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="w-full bg-gray-900 p-2 rounded"
          >
            <option value="">Select entity *</option>
            {filteredEntities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} {e.state ? `(${e.state})` : ""}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setCounty("");
              }}
              className="bg-gray-900 p-2 rounded"
            >
              <option value="">State (optional)</option>
              {Object.keys(stateCountyData).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={county}
              disabled={!state}
              onChange={(e) => setCounty(e.target.value)}
              className="bg-gray-900 p-2 rounded"
            >
              <option value="">County (optional)</option>
              {state && stateCountyData[state].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-900 p-2 rounded"
          />

          <input
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-gray-900 p-2 rounded"
          />

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={uploading}
              className="px-8 py-3 rounded-2xl font-extrabold bg-yellow-300 text-gray-900 hover:bg-yellow-200 disabled:opacity-50"
            >
              {uploading ? "Adding…" : "Add to Vault"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
