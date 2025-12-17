import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { stateCountyData } from "../data/stateCountyData";

export default function VaultUpload() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  // 🔗 NEW: vault entry context (if coming from MyVault)
  const vaultEntryId = locationState?.vault_entry_id || null;

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
     LOAD ENTITIES (ONLY IF NEEDED)
     ========================= */
  useEffect(() => {
    if (vaultEntryId) return; // 👈 vault entry already defines entity

    api
      .get("/ratings/entities")
      .then((res) => setEntities(res.data || []))
      .catch(() => {});
  }, [vaultEntryId]);

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
    if (vaultEntryId) return [];
    const q = entitySearch.trim().toLowerCase();
    if (!q) return [];
    return entities.filter((e) =>
      `${e.name} ${e.state || ""} ${e.county || ""} ${e.type || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [entitySearch, entities, vaultEntryId]);

  /* =========================
     SUBMIT
     ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("A file is required.");
      return;
    }

    if (!vaultEntryId && !entityId) {
      alert("An entity is required.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("location", location);
      formData.append("is_anonymous", isAnonymous);

      if (vaultEntryId) {
        // 🔗 NEW: attach to vault entry
        formData.append("vault_entry_id", vaultEntryId);
      } else {
        // Legacy standalone upload
        formData.append("entity_id", entityId);
        formData.append("is_public", isPublic);
      }

      await api.post("/vault", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Record uploaded successfully.");
      navigate(vaultEntryId ? "/vault/mine" : "/vault/public");
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
            {vaultEntryId
              ? "Add Supporting Evidence"
              : "Submit a Public Record"}
          </h1>
          <p className="text-sm opacity-70 mt-2">
            {vaultEntryId
              ? "Attach media that supports your documented entry."
              : "Preserve media connected to a public official, agency, or institution."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* FILE */}
          <div className="rounded-3xl border bg-[#f7f1e1] p-12 text-center shadow-md">
            <label className="cursor-pointer block">
              <div className="text-5xl mb-3">📎</div>
              <p className="font-medium">Add supporting media</p>
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

          {/* ENTITY SEARCH (LEGACY ONLY) */}
          {!vaultEntryId && (
            <div className="space-y-3 relative">
              <p className="text-sm font-medium">
                Who is this record associated with?
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
                  {filteredEntities.slice(0, 8).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setEntityId(e.id);
                        setEntitySearch(e.name);
                        setEntitySelected(true);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#efe6cf]"
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DESCRIPTION */}
          <textarea
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border bg-[#fdf9ef]"
          />

          {/* SUBMIT */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={uploading}
              className="w-16 h-16 rounded-full bg-[#cfa64a] text-3xl font-bold shadow-lg"
            >
              {uploading ? "…" : "+"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
