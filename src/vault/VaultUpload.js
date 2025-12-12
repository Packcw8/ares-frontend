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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/ratings/entities").then((res) => setEntities(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !entityId) {
      alert("File and entity are required.");
      return;
    }

    try {
      setUploading(true);

      // 1️⃣ Get presigned upload URL
      const uploadRes = await api.post("/vault/upload-url", {
        filename: file.name,
        content_type: file.type,
      });

      const { upload_url, file_url } = uploadRes.data;

      // 2️⃣ Upload file directly to Backblaze
      await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      // 3️⃣ Save metadata
      await api.post("/vault", {
        blob_url: file_url,
        description,
        tags,
        location,
        is_public: isPublic,
        is_anonymous: isAnonymous,
        entity_id: Number(entityId),
      });

      alert("Evidence uploaded successfully.");

      setFile(null);
      setDescription("");
      setTags("");
      setLocation("");
      setEntityId("");
      setIsAnonymous(false);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 space-y-4 text-white">
        <h1 className="text-2xl font-bold">📤 Upload Evidence</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-900 p-2 rounded"
          />

          <input
            type="text"
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-gray-900 p-2 rounded"
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-gray-900 p-2 rounded"
          />

          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="w-full bg-gray-900 p-2 rounded"
          >
            <option value="">Select Entity</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.state})
              </option>
            ))}
          </select>

          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
            />{" "}
            Make Public
          </label>

          <label>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
            />{" "}
            Submit Anonymously
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            {uploading ? "Uploading…" : "Submit"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
