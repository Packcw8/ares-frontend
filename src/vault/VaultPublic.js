import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultPublic() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* =========================
     LOAD PUBLIC VAULT FEED
     ========================= */
  useEffect(() => {
    api
      .get("/vault-entries/feed")
      .then((res) => setFeed(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (items, index) => {
    setLightboxItems(items);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxItems([]);
    setLightboxIndex(0);
  };

  const next = () => {
    setLightboxIndex((i) =>
      Math.min(i + 1, lightboxItems.length - 1)
    );
  };

  const prev = () => {
    setLightboxIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold text-slate-900">
          Public Records
        </h1>

        {loading && (
          <p className="text-sm text-slate-500">
            Loading activity…
          </p>
        )}

        {!loading && feed.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12">
            No public records yet.
          </p>
        )}

        <div className="space-y-6">
          {feed.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              navigate={navigate}
              openLightbox={openLightbox}
            />
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNext={next}
          onPrev={prev}
        />
      )}
    </Layout>
  );
}

/* ======================================================
   FEED CARD
   ====================================================== */
function FeedCard({ item, navigate, openLightbox }) {
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
              onClick={() =>
                navigate(`/ratings/${entity.id}`)
              }
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
          {item.testimony}
        </p>

        {item.evidence?.length > 0 && (
          <EvidenceGrid
            evidence={item.evidence}
            openLightbox={openLightbox}
          />
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
   EVIDENCE GRID
   ====================================================== */
function EvidenceGrid({ evidence, openLightbox }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {evidence.slice(0, 4).map((ev, idx) => (
        <EvidenceThumb
          key={ev.id}
          ev={ev}
          index={idx}
          all={evidence}
          openLightbox={openLightbox}
        />
      ))}
    </div>
  );
}

function EvidenceThumb({ ev, index, all, openLightbox }) {
  const url = ev.blob_url?.toLowerCase() || "";

  if (/\.(jpg|jpeg|png|webp|gif)$/.test(url)) {
    return (
      <img
        src={ev.blob_url}
        onClick={() => openLightbox(all, index)}
        className="h-36 w-full object-cover rounded-xl cursor-pointer"
        alt="evidence"
      />
    );
  }

  if (/\.(mp4|webm)$/.test(url)) {
    return (
      <video
        src={ev.blob_url}
        onClick={() => openLightbox(all, index)}
        className="h-36 w-full object-cover rounded-xl cursor-pointer"
      />
    );
  }

  return (
    <button
      onClick={() => openLightbox(all, index)}
      className="h-36 rounded-xl bg-slate-100 text-sm text-indigo-600 flex items-center justify-center"
    >
      Open file
    </button>
  );
}

/* ======================================================
   LIGHTBOX
   ====================================================== */
function Lightbox({ items, index, onClose, onNext, onPrev }) {
  const item = items[index];
  const url = item?.blob_url?.toLowerCase() || "";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl"
      >
        ×
      </button>

      {index > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-4 text-white text-4xl"
        >
          ‹
        </button>
      )}

      {index < items.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 text-white text-4xl"
        >
          ›
        </button>
      )}

      <div className="max-w-[90vw] max-h-[90vh]">
        {/\.(jpg|jpeg|png|webp|gif)$/.test(url) && (
          <img
            src={item.blob_url}
            className="max-h-[90vh] max-w-[90vw] rounded-xl"
            alt="evidence"
          />
        )}

        {/\.(mp4|webm)$/.test(url) && (
          <video
            src={item.blob_url}
            controls
            autoPlay
            className="max-h-[90vh] max-w-[90vw] rounded-xl"
          />
        )}

        {/\.(mp3|wav|ogg)$/.test(url) && (
          <audio src={item.blob_url} controls className="w-full" />
        )}

        {!/\.(jpg|jpeg|png|webp|gif|mp4|webm|mp3|wav|ogg)$/.test(url) && (
          <a
            href={item.blob_url}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 underline"
          >
            Open file
          </a>
        )}
      </div>
    </div>
  );
}
