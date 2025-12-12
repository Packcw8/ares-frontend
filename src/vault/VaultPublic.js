import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function formatDateGroup(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();

  const isSameDay = d.toDateString() === today.toDateString();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay) return "Today";
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

  useEffect(() => {
    api
      .get("/vault/feed")
      .then((res) => setEvidenceList(res.data))
      .catch((err) => {
        console.error("Failed to load vault feed", err);
      })
      .finally(() => setLoading(false));
  }, []);

  let lastDateLabel = null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">
          Evidence Vault
        </h1>

        {loading && <p className="text-gray-500">Loading evidence…</p>}

        {!loading && evidenceList.length === 0 && (
          <p className="italic text-gray-500">No public evidence yet.</p>
        )}

        <div className="space-y-10">
          {evidenceList.map((ev) => {
            const dateLabel = formatDateGroup(ev.created_at);
            const showDate = dateLabel !== lastDateLabel;
            lastDateLabel = dateLabel;

            return (
              <div key={ev.id}>
                {showDate && (
                  <div className="sticky top-0 z-10 bg-white/90 backdrop-blur py-2 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {dateLabel}
                    </p>
                  </div>
                )}

                <div
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden
                             opacity-0 translate-y-4 animate-fadeIn"
                >
                  {/* Header */}
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-medium text-gray-800">
                      {ev.entity.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ev.entity.county}, {ev.entity.state}
                    </p>
                  </div>

                  {/* Media */}
                  <div className="bg-black">
                    {ev.media_url.match(/\.(mp4|webm)$/i) && (
                      <video
                        controls
                        src={ev.media_url}
                        className="w-full max-h-[70vh] object-contain"
                      />
                    )}

                    {ev.media_url.match(/\.(jpe?g|png|gif)$/i) && (
                      <img
                        src={ev.media_url}
                        alt="Evidence"
                        className="w-full max-h-[70vh] object-contain"
                      />
                    )}

                    {ev.media_url.match(/\.(mp3|wav)$/i) && (
                      <audio controls src={ev.media_url} className="w-full" />
                    )}

                    {!ev.media_url.match(/\.(mp4|webm|jpe?g|png|gif|mp3|wav)$/i) && (
                      <div className="p-4 bg-gray-100">
                        <a
                          href={ev.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          View evidence file
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {ev.description && (
                    <div className="px-5 py-4">
                      <p className="text-sm text-gray-800 leading-relaxed">
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
