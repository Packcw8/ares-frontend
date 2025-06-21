// src/vault/VaultUpload.js
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultUpload() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [entityId, setEntityId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [entities, setEntities] = useState([]);

  useEffect(() => {
    api.get("/ratings/entities").then((res) => setEntities(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a file.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("location", location);
    formData.append("is_public", isPublic);
    formData.append("is_anonymous", isAnonymous);
    formData.append("entity_id", entityId);

    try {
      await api.post("/vault/upload", formData);
      alert("Evidence uploaded successfully.");
    } catch (err) {
      alert("Upload failed: " + err.response?.data?.detail);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">📤 Upload Evidence</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="text" placeholder="Location (City, State)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <select value={entityId} onChange={(e) => setEntityId(e.target.value)} required>
          <option value="">Select Entity</option>
          {entities.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.state})
            </option>
          ))}
        </select>
        <label>
          <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} /> Make Public
        </label>
        <label>
          <input type="checkbox" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} /> Submit Anonymously
        </label>
        <button type="submit">Submit</button>
      </form>
    </Layout>
  );
}
