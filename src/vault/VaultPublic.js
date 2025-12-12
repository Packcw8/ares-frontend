import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function formatDateGroup(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function VaultPublic() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/vault/feed")
      .then((res) => setEvidenceList(res.data || []))
      .catch((err) => console.error("Failed to load vault feed", err))
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Live smart search (no button)
  const filteredEvidence = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return evidenceList;

    return evidenceList.filter((ev) => {
      const entity = ev.entity || {};
      const name = entity.name?.toLowerCase() || "";
      const state = entity.state?.toLowerCase() || "";
      const county = entity.county?.toLowerCase() || "";

      // typing "w" → west virginia, washington, wisconsin, etc
      if (q.length <= 2) {
        return (
          state.startsWith(q) ||
          county.startsWith(q) ||
          name.startsWith(q)
        );
      }

      // typing "west" → west virginia content
      if (q.startsWith("west")) {
        return state.startsWith(q);
      }

      // general partial match
      return (
        name.includes(q) || state.includes(q) || county.includes(q)
      );
    });
  }, [search, evidenceList]);

  let lastDateLabel = null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Evidence Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Public accountability records — searchable by state, county, or entity
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type: w → west virginia → county → official"
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {loading && <p className="text-slate-500">Loading evidence…</p>}

        {!loading && filteredEvidence.length === 0 && (
          <p className="italic text-slate-500">No matching evidence found.</p>
        )}

        <div className="space-y-12">
          {filteredEvidence.map((ev) => {
            const dateLabel = formatDateGroup(ev.created_at);
            const showDate = dateLabel && dateLabel !== lastDateLabel;
            if (showDate) lastDateLabel = dateLabel;

            return (
              <div key={ev.id}>
                {showDate && (
                  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur py-2 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {dateLabel}
                    </p>
                  </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Entity header */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <p className="text-sm font-semibold text-slate-900">
                      {ev.entity?.name || "Unknown Entity"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ev.entity?.county || ""}
                      {ev.entity?.state ? `, ${ev.entity.state}` : ""}
                    </p>
                  </div>

                  {/* Media */}
                  <div className="bg-black">
                    {ev.media_url && ev.media_url.match(/\.(mp4|webm)$/i) && (
                      <video
                        controls
                        preload="metadata"
                        src={ev.media_url}
                        className="w-full max-h-[75vh] object-contain"
                      />
                    )}

                    {ev.media_url && ev.media_url.match(/\.(jpe?g|png|gif)$/i) && (
                      <img
                        src={ev.media_url}
                        alt="Evidence"
                        className="w-full max-h-[75vh] object-contain"
                      />
                    )}

                    {ev.media_url && ev.media_url.match(/\.(mp3|wav)$/i) && (
                      <audio controls src={ev.media_url} className="w-full" />
                    )}

                    {ev.media_url && !ev.media_url.match(/\.(mp4|webm|jpe?g|png|gif|mp3|wav)$/i) && (
                      <div className="p-4 bg-slate-100">
                        <a
                          href={ev.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 underline text-sm"
                        >
                          View evidence file
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {ev.description && (
                    <div className="px-6 py-5">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
