import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 🔹 Fetch user role (DO NOT redirect)
  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUserRole(res.data.role))
      .catch(() => setUserRole("citizen"));
  }, []);

  // 🔹 Fetch entities
  useEffect(() => {
    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data))
      .catch(console.error);
  }, []);

  // 🔹 Auto-select entity after returning from AddOfficialPage
  useEffect(() => {
    const returnedEntityId = searchParams.get("entityId");
    if (returnedEntityId && entities.length > 0) {
      const found = entities.find(
        (e) => e.id === Number(returnedEntityId)
      );
      if (found) {
        setEntityId(found.id);
        setEntityQuery(found.name);
      }
    }
  }, [searchParams, entities]);

  const filteredEntities = useMemo(() => {
    if (!entityQuery || entityId) return [];
    return entities
      .filter((e) =>
        e.name.toLowerCase().includes(entityQuery.toLowerCase())
      )
      .slice(0, 8);
  }, [entityQuery, entities, entityId]);

  const handleSelectEntity = (entity) => {
    setEntityId(entity.id);
    setEntityQuery(entity.name);
  };

  const canPublish =
    userRole === "official_verified" || userRole === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canPublish) {
      alert("Only verified officials can publish discussions.");
      return;
    }

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
        <h1 className="text-2xl font-bold text-[#283d63] mb-6">
          Start a New Discussion
        </h1>

        {!canPublish && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-100 text-yellow-800">
            You may create or link entities, but only verified officials can
            publish forum discussions.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ENTITY SELECTION */}
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

              {filteredEntities.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-xl shadow max-h-64 overflow-y-auto mt-1">
                  {filteredEntities.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => handleSelectEntity(e)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100"
                    >
                      {e.name}
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
                      `/add-official?name=${encodeURIComponent(
                        entityQuery
                      )}&returnTo=/forum/new`
                    )
                  }
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Add it here
                </button>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <input
              type="text"
              placeholder="Discussion title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300"
              disabled={!canPublish}
              required
            />

            <textarea
              rows="7"
              placeholder="Write the discussion content…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300"
              disabled={!canPublish}
              required
            />
          </div>

          <div className="text-right">
            <button
              disabled={!canPublish}
              className="bg-[#283d63] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Publish Discussion
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default NewForumPost;
