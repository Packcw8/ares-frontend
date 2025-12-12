import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

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

  if (loading) {
    return (
      <Layout>
        <div className="p-4 text-white">Loading Vault…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold text-white">
          🏛️ Evidence Vault
        </h1>

        {evidenceList.length === 0 && (
          <p className="italic text-gray-400">
            No public evidence yet.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {evidenceList.map((ev) => (
            <div
              key={ev.id}
              className="bg-gray-900 text-white rounded-lg p-4 space-y-3"
            >
              <p className="text-sm text-yellow-400 font-semibold">
                {ev.entity.name} ({ev.entity.county}, {ev.entity.state})
              </p>

              {ev.description && (
                <p className="text-sm">{ev.description}</p>
              )}

              {/* MEDIA RENDERING */}
              {ev.media_url.match(/\.(mp4|webm)$/i) && (
                <video
                  controls
                  src={ev.media_url}
                  className="w-full rounded"
                />
              )}

              {ev.media_url.match(/\.(jpe?g|png|gif)$/i) && (
                <img
                  src={ev.media_url}
                  alt="Evidence"
                  className="w-full rounded"
                />
              )}

              {ev.media_url.match(/\.(mp3|wav)$/i) && (
                <audio controls src={ev.media_url} className="w-full" />
              )}

              {!ev.media_url.match(/\.(mp4|webm|jpe?g|png|gif|mp3|wav)$/i) && (
                <a
                  href={ev.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline text-sm"
                >
                  View evidence file
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
