import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultPublic() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/feed")
      .then(res => setFeed(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        <h1 className="text-xl font-bold text-slate-900">
          Community Records
        </h1>

        {loading && (
          <p className="text-sm text-slate-500">Loading activity…</p>
        )}

        {!loading && feed.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12">
            No public records yet.
          </p>
        )}

        <div className="space-y-6">
          {feed.map(item => (
            <FeedCard
              key={item.id}
              item={item}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

/* ======================================================
   FEED CARD
   ====================================================== */
function FeedCard({ item, navigate }) {
  const entity = item.entity;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="flex items-start gap-3 px-4 py-3 border-b bg-slate-50">
        <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
          {entity?.name?.[0] || "A"}
        </div>

        <div className="flex-1">
          {entity && (
            <button
              onClick={() => navigate(`/ratings/${entity.id}`)}
              className="text-sm font-semibold text-slate-900 hover:underline"
            >
              {entity.name}
            </button>
          )}

          <p className="text-xs text-slate-500">
            Public record
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="px-4 py-4 space-y-4">
        <p className="text-sm text-slate-800 whitespace-pre-line">
          {item.testimony || item.description}
        </p>

        {/* ✅ EVIDENCE — SAME LOGIC AS MYVAULT */}
        {item.evidence?.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {item.evidence.map(ev => (
              <div
                key={ev.id}
                className="border rounded-xl p-3 flex flex-col gap-2"
              >
                {renderEvidence(ev)}
                {ev.description && (
                  <p className="text-xs text-slate-600">
                    {ev.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-4 py-3 border-t bg-slate-50 text-xs text-slate-500">
        Posted publicly
      </div>
    </div>
  );
}

/* ======================================================
   EVIDENCE RENDER (COPIED FROM MYVAULT)
   ====================================================== */
function renderEvidence(ev) {
  const url = ev.blob_url?.toLowerCase() || "";

  if (/\.(jpg|jpeg|png|webp|gif)$/.test(url)) {
    return (
      <img
        src={ev.blob_url}
        className="h-32 w-full object-cover rounded-lg"
        alt="evidence"
      />
    );
  }

  if (/\.(mp4|webm)$/.test(url)) {
    return (
      <video
        src={ev.blob_url}
        controls
        className="h-32 w-full rounded-lg"
      />
    );
  }

  if (/\.(mp3|wav|ogg)$/.test(url)) {
    return (
      <audio
        src={ev.blob_url}
        controls
        className="w-full"
      />
    );
  }

  return (
    <a
      href={ev.blob_url}
      target="_blank"
      rel="noreferrer"
      className="text-indigo-600 text-sm underline"
    >
      Open file
    </a>
  );
}
