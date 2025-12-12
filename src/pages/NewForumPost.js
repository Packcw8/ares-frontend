import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { stateCountyData } from "../data/stateCountyData";

const ROLE_OPTIONS = [
  "Police Department",
  "Sheriff’s Office",
  "Court",
  "Judge",
  "Prosecutor",
  "CPS / Child Services",
  "Government Agency",
  "Individual Official",
];

function NewForumPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [entityQuery, setEntityQuery] = useState("");
  const [entityId, setEntityId] = useState(null);
  const [entities, setEntities] = useState([]);

  const [creatingEntity, setCreatingEntity] = useState(false);
  const [entityForm, setEntityForm] = useState({
    name: "",
    type: "agency",
    role: "",
    state: "",
    county: "",
  });

  const [stateQuery, setStateQuery] = useState("");
  const [countyQuery, setCountyQuery] = useState("");

  useEffect(() => {
    api.get("/ratings/entities").then((res) => setEntities(res.data));
  }, []);

  const filteredEntities = useMemo(() => {
    if (!entityQuery) return [];
    return entities.filter((e) =>
      e.name.toLowerCase().includes(entityQuery.toLowerCase())
    );
  }, [entityQuery, entities]);

  const stateOptions = useMemo(() => {
    if (!stateQuery) return [];
    return Object.entries(stateCountyData)
      .map(([abbr, data]) => ({ abbr, name: data.name }))
      .filter((s) =>
        s.name.toLowerCase().includes(stateQuery.toLowerCase())
      );
  }, [stateQuery]);

  const countyOptions = useMemo(() => {
    if (!entityForm.state || !countyQuery) return [];
    return stateCountyData[entityForm.state].counties.filter((c) =>
      c.toLowerCase().includes(countyQuery.toLowerCase())
    );
  }, [entityForm.state, countyQuery]);

  const handleCreateEntity = async () => {
    try {
      const res = await api.post("/ratings/entities", entityForm);
      setEntities((prev) => [...prev, res.data]);
      setEntityId(res.data.id);
      setEntityQuery(res.data.name);
      setCreatingEntity(false);
      setStateQuery("");
      setCountyQuery("");
    } catch (err) {
      alert("Failed to create entity");
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!entityId) {
      alert("Select or create an entity first.");
      return;
    }

    await api.post("/forum/create", {
      title,
      body: content,
      entity_id: entityId,
    });

    window.location.href = "/forum";
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-[#283d63]">
          New Forum Discussion
        </h1>

        {/* ENTITY SEARCH */}
        <div className="bg-white p-4 rounded-xl border">
          <label className="text-sm font-semibold">Entity</label>
          <input
            value={entityQuery}
            onChange={(e) => {
              setEntityQuery(e.target.value);
              setEntityId(null);
              setCreatingEntity(false);
            }}
            placeholder="Search entity…"
            className="w-full mt-2 p-2 border rounded"
          />

          {filteredEntities.length > 0 && !entityId && (
            <div className="mt-2 border rounded bg-white">
              {filteredEntities.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setEntityId(e.id);
                    setEntityQuery(e.name);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}

          {entityQuery && filteredEntities.length === 0 && !entityId && (
            <button
              type="button"
              onClick={() => {
                setCreatingEntity(true);
                setEntityForm((f) => ({ ...f, name: entityQuery }));
              }}
              className="mt-3 text-blue-600 font-semibold"
            >
              + Create new entity
            </button>
          )}
        </div>

        {/* INLINE ENTITY CREATE */}
        {creatingEntity && (
          <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
            <h2 className="font-semibold">Create Entity</h2>

            {/* ROLE (NOT FREE TEXT) */}
            <select
              value={entityForm.role}
              onChange={(e) =>
                setEntityForm({ ...entityForm, role: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select role</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* STATE TYPEAHEAD */}
            <input
              placeholder="State"
              value={stateQuery}
              onChange={(e) => setStateQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />

            {stateQuery && (
              <div className="border rounded bg-white max-h-48 overflow-y-auto">
                {stateOptions.map((s) => (
                  <button
                    key={s.abbr}
                    type="button"
                    onClick={() => {
                      setEntityForm({ ...entityForm, state: s.abbr });
                      setStateQuery(s.name);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {/* COUNTY TYPEAHEAD */}
            {entityForm.state && (
              <>
                <input
                  placeholder="County"
                  value={countyQuery}
                  onChange={(e) => setCountyQuery(e.target.value)}
                  className="w-full p-2 border rounded"
                />

                {countyQuery && (
                  <div className="border rounded bg-white max-h-48 overflow-y-auto">
                    {countyOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setEntityForm({ ...entityForm, county: c });
                          setCountyQuery(c);
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={handleCreateEntity}
              className="bg-[#283d63] text-white px-4 py-2 rounded font-semibold"
            >
              Create Entity
            </button>
          </div>
        )}

        {/* POST */}
        <form onSubmit={handleSubmitPost} className="space-y-4">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded"
          />

          <textarea
            placeholder="Write discussion…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded"
            rows={6}
          />

          <button className="bg-[#283d63] text-white px-6 py-3 rounded font-semibold">
            Publish
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default NewForumPost;
