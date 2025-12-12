import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function NewForumPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isAMA, setIsAMA] = useState(false);

  const [entityQuery, setEntityQuery] = useState("");
  const [entityId, setEntityId] = useState(null);
  const [entities, setEntities] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      const canPost =
        res.data.role === "official_verified" || res.data.role === "admin";

      if (!canPost) {
        navigate("/forum");
      }
    });

    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data))
      .catch(console.error);
  }, [navigate]);

  const filteredEntities = useMemo(() => {
    if (!entityQuery) return [];
    return entities
      .filter((e) =>
        e.name.toLowerCase().includes(entityQuery.toLowerCase())
      )
      .slice(0, 8);
  }, [entityQuery, entities]);

  const handleSelectEntity = (entity) => {
    setEntityId(entity.id);
    setEntityQuery(entity.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!entityId) {
      alert("Please select an entity or add it first.");
      return;
    }

    try {
      await api.post("/forum/create", {
        title,
        body: content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        entity_id: entityId,
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

          {/* ENTITY SEARCH */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for an official or entity..."
              value={entityQuery}
              onChange={(e) => {
                setEntityQuery(e.target.value);
                setEntityId(null);
              }}
              className="w-full border rounded p-2"
            />

            {filteredEntities.length > 0 && !entityId && (
              <div className="absolute z-10 w-full bg-white border rounded shadow max-h-64 overflow-y-auto">
                {filteredEntities.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => handleSelectEntity(e)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex justify-between"
                  >
                    <span>{e.name}</span>
                    {e.is_verified && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ➕ ADD ENTITY CTA */}
          {entityQuery && filteredEntities.length === 0 && !entityId && (
            <div className="text-sm text-gray-600">
              Don’t see this entity?{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/add-official?name=${encodeURIComponent(entityQuery)}`
                  )
                }
                className="text-blue-600 hover:underline font-semibold"
              >
                Add it here
              </button>
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              Pin
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAMA}
                onChange={(e) => setIsAMA(e.target.checked)}
              />
              AMA
            </label>
          </div>

          <button className="bg-[#283d63] text-white px-4 py-2 rounded w-full">
            Submit Post
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default NewForumPost;
