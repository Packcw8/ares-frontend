import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function NewForumPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isAMA, setIsAMA] = useState(false);
  const [entityId, setEntityId] = useState("");
  const [entities, setEntities] = useState([]);
  const [role, setRole] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      setRole(res.data.role);
      setIsVerified(res.data.is_verified);

      if (
        !(
          res.data.role === "official_verified" ||
          res.data.role === "admin"
        )
      ) {
        navigate("/forum");
      }
    });

    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data))
      .catch(console.error);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/forum/create", {
        title,
        body: content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        entity_id: parseInt(entityId),
        is_pinned: isPinned,
        is_ama: isAMA,
      });

      navigate("/forum");
    } catch (err) {
      alert(err.response?.data?.detail || "Error creating post.");
    }
  };

  return (
    <Layout>
      <div className="p-4 pb-24 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-[#c2a76d]">
          Start a New Discussion
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded p-2"
          />

          <textarea
            rows="6"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full border rounded p-2"
          />

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border rounded p-2"
          />

          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            required
            className="w-full border rounded p-2"
          >
            <option value="">Select an entity</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          <div className="flex gap-4">
            <label>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />{" "}
              Pin
            </label>
            <label>
              <input
                type="checkbox"
                checked={isAMA}
                onChange={(e) => setIsAMA(e.target.checked)}
              />{" "}
              AMA
            </label>
          </div>

          <button className="bg-[#283d63] text-white px-4 py-2 rounded">
            Submit Post
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default NewForumPost;
