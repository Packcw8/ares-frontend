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

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data))
      .catch((err) => console.error("Error fetching entities:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    if (!entityId) {
      alert("Please select an entity.");
      return;
    }

    try {
      await api.post(
        "/forum/create",
        {
          title,
          body: content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          entity_id: parseInt(entityId),
          is_pinned: isPinned,
          is_ama: isAMA,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/forum");
    } catch (err) {
      console.error(err);
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

          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Content</label>
            <textarea
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Entity</label>
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select an entity...</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name || `Entity #${entity.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              Pin this post
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAMA}
                onChange={(e) => setIsAMA(e.target.checked)}
              />
              Mark as AMA
            </label>
          </div>

          <button
            type="submit"
            className="bg-[#283d63] text-white font-bold px-4 py-2 rounded hover:bg-[#1d2c49] transition"
          >
            Submit Post
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default NewForumPost;
