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
      <div className="px-4 py-8 max-w-3xl mx-auto">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-[#283d63] mb-6">
          Start a New Discussion
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 🔗 ENTITY SELECTION (PRIMARY) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Entity this discussion is about
            </h2>

            <div className="relative">
              <input
                type="text"
                placeholder="Search for an official or agency…"
                value={entityQuery}
                onChange={(e) => {
                  setEntityQuery(e.target.value);
                  setEntityId(null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c2a76d]"
              />

              {filteredEntities.length > 0 && !entityId && (
                <div className="absolute z-10 w-full bg-white border rounded-xl shadow max-h-64 overflow-y-auto mt-1">
                  {filteredEntities.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => handleSelectEntity(e)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex justify-between"
                    >
                      <span className="font-medium">{e.name}</span>
                      {e.is_verified && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {entityQuery && filteredEntities.length === 0 && !entityId && (
              <div className="mt-2 text-sm text-gray-600">
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
          </div>

          {/* 🧵 DISCUSSION CONTENT */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <input
              type="text"
              placeholder="Discussion title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c2a76d]"
            />

            <textarea
              rows="7"
              placeholder="Write the discussion content…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c2a76d]"
            />

            <input
              type="text"
              placeholder="Tags (comma-separated, optional)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300"
            />
          </div>

          {/* ⚙️ OPTIONS */}
          <div className="flex gap-8 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              Pin discussion
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAMA}
                onChange={(e) => setIsAMA(e.target.checked)}
              />
              AMA format
            </label>
          </div>

          {/* 🚀 SUBMIT */}
          <div className="text-right">
            <button className="bg-[#283d63] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1d2c49] transition">
              Publish Discussion
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default NewForumPost;
