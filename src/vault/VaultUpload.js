import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { stateCountyData } from "../data/stateCountyData";

export default function VaultUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [entityId, setEntityId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [entities, setEntities] = useState([]);
  const [entitySearch, setEntitySearch] = useState("");
  const [entitySelected, setEntitySelected] = useState(false);

  const [stateQuery, setStateQuery] = useState("");
  const [countyQuery, setCountyQuery] = useState("");
  const [state, setState] = useState("");
  const [county, setCounty] = useState("");

  /* =========================
     LOAD ENTITIES
     ========================= */
  useEffect(() => {
    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data || []))
      .catch(() => {});
  }, []);

  /* =========================
     AUTO LOCATION
     ========================= */
  useEffect(() => {
    if (state && county) setLocation(`${county}, ${state}`);
    else if (state) setLocation(state);
  }, [state, county]);

  /* =========================
     ENTITY SEARCH
     ========================= */
  const filteredEntities = useMemo(() => {
    const q = entitySearch.trim().toLowerCase();
    if (!q) return [];
    return entities.filter((e) =>
      `${e.name} ${e.state || ""} ${e.county || ""} ${e.type || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [entitySearch, entities]);

  /* =========================
     STATE SEARCH
     ========================= */
  const stateOptions = useMemo(() => {
    if (!stateQuery) return [];
    return Object.entries(stateCountyData)
      .map(([abbr, data]) => ({ abbr, name: data.name }))
      .filter((s) => s.name.toLowerCase().includes(stateQuery.toLowerCase()));
  }, [stateQuery]);

  /* =========================
     COUNTY SEARCH
     ========================= */
  const countyOptions = useMemo(() => {
    if (!state || !countyQuery) return [];
    const counties = stateCountyData[state]?.counties;
    return Array.isArray(counties)
      ? counties.filter((c) =>
          c.toLowerCase().includes(countyQuery.toLowerCase())
        )
      : [];
  }, [state, countyQuery]);

  /* =========================
     SUBMIT
     ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !entityId) {
      alert("A file and an entity are required.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity_id", entityId);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("location", location);
      formData.append("is_public", isPublic);
      formData.append("is_anonymous", isAnonymous);

      await api.post("/vault", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Public record submitted.");
      navigate("/vault/public");
    } catch {
      alert("Submission failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold">
            Submit a Public Record
          </h1>
          <p className="text-sm opacity-70 mt-2">
            Preserve media or written accounts connected to a public official,
            agency, or institution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* FILE */}
          <div className="rounded-3xl border bg-[#f7f1e1] p-12 text-center shadow-md">
            <label className="cursor-pointer block">
              <div className="text-5xl mb-3">📎</div>
              <p className="font-medium">
                Add a file that supports this public record
              </p>
              <p className="text-xs opacity-60 mt-1">
                Video, audio, image, or document
              </p>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            {file && (
              <p className="mt-4 text-sm opacity-80">
                Selected: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          {/* ENTITY SEARCH */}
          <div className="space-y-3 relative">
            <p className="text-sm font-medium">
              Who is this record associated with?{" "}
              <span className="text-red-600">*</span>
            </p>

            <input
              placeholder="Search by name, state, or county"
              value={entitySearch}
              onChange={(e) => {
                setEntitySearch(e.target.value);
                setEntityId("");
                setEntitySelected(false);
              }}
              className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
            />

            {entitySearch && !entitySelected && (
              <div className="absolute z-30 w-full bg-[#fdf9ef] border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {filteredEntities.length > 0 ? (
                  filteredEntities.slice(0, 8).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setEntityId(e.id);
                        setEntitySearch(
                          `${e.name}${e.state ? ` (${e.state})` : ""}`
                        );
                        setEntitySelected(true);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#efe6cf]"
                    >
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs opacity-60">
                        {e.type} • {e.county || "-"}, {e.state || ""}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm opacity-70">
                    No matching entity found.
                  </div>
                )}

                <div className="border-t px-4 py-3 bg-[#f7f1e1]">
                  <button
                    type="button"
                    onClick={() => navigate("/ratings/new")}
                    className="text-sm font-medium text-[#8b1e3f] hover:underline"
                  >
                    Don’t see the entity? Add it
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LOCATION + DESCRIPTION */}
          <div className="rounded-3xl border bg-[#f7f1e1] p-8 space-y-6">
            <textarea
              placeholder="Describe what this record documents (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
            />

            <input
              placeholder="Optional tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
            />
          </div>

          {/* VISIBILITY */}
          <div className="rounded-3xl border bg-[#f7f1e1] p-6 space-y-4">
            <p className="text-sm font-medium">Visibility</p>

            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic((v) => !v)}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">
                  Make this record public
                </p>
                <p className="text-xs opacity-70">
                  Public records appear in the public feed and on entity pages.
                  Private records are saved but only visible to you.
                </p>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={uploading}
              className="w-16 h-16 rounded-full bg-[#cfa64a] hover:bg-[#b8943f] text-3xl font-bold shadow-lg"
            >
              {uploading ? "…" : "+"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
