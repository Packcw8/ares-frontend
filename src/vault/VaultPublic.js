import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import ShareButton from "../components/ShareButton";
import { timeAgo, fullDate } from "../utils/time";
import { displayName } from "../utils/displayName";

export default function VaultPublic() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muted, setMuted] = useState(true);

  // Keep refs to videos so we can pause/play when they enter/leave the viewport
  const videoRefs = useRef({});

  // ------------------------------------------------------
  // Load feed + normalize media field
  // ------------------------------------------------------
  useEffect(() => {
    api
      .get("/vault/feed")
      .then((res) => {
        const normalized = (res.data || []).map((ev) => ({
          ...ev,
          // 🔥 Normalize backend storage → frontend contract
          // backend stores: blob_url
          // frontend uses: media_url
          media_url: ev.media_url || ev.blob_url,
        }));
        setEvidenceList(normalized);
      })
      .catch((err) => console.error("Failed to load vault feed", err))
      .finally(() => setLoading(false));
  }, []);

  // ------------------------------------------------------
  // Pause videos when not in viewport (TikTok-style)
  // ------------------------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!video) return;

          if (entry.isIntersecting) {
            // try to autoplay when in view
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 } // must be ~60% in view
    );

    // observe all current videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [evidenceList]);

  // ------------------------------------------------------
  // Search filter (state / county / entity)
  // ------------------------------------------------------
  const filteredEvidence = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return evidenceList;

    return evidenceList.filter((ev) => {
      const entity = ev.entity || {};
      const name = entity.name?.toLowerCase() || "";
      const state = entity.state?.toLowerCase() || "";
      const county = entity.county?.toLowerCase() || "";

      if (q.length <= 2) {
        return (
          name.startsWith(q) ||
          state.startsWith(q) ||
          county.startsWith(q)
        );
      }

      return (
        name.includes(q) ||
        state.includes(q) ||
        county.includes(q)
      );
    });
  }, [search, evidenceList]);

  const isVideo = (url) => !!url && /\.(mp4|webm)$/i.test(url);
  const isImage = (url) => !!url && /\.(jpe?g|png|gif)$/i.test(url);
  const isAudio = (url) => !!url && /\.(mp3|wav)$/i.test(url);

  return (
    <Layout>
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Evidence Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            TikTok-style feed — searchable by state, county, or entity
          </p>

          <div className="mt-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by state, county, or entity…"
              className="w-full rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-center text-slate-500 mt-6">Loading evidence…</p>
      )}

      {!loading && filteredEvidence.length === 0 && (
        <p className="text-center italic text-slate-500 mt-6">
          No matching evidence found.
        </p>
      )}

      {/* TikTok-style vertical snapping feed */}
      <div className="h-[calc(100vh-150px)] overflow-y-scroll snap-y snap-mandatory bg-black">
        {filteredEvidence.map((ev) => {
          const url = ev.media_url;

          return (
            <div
              key={ev.id}
              id={`evidence-${ev.id}`}
              className="snap-start h-[calc(100vh-150px)] w-full relative flex items-center justify-center bg-black"
            >
              {/* Media Layer */}
              {isVideo(url) && (
                <video
                  ref={(el) => (videoRefs.current[ev.id] = el)}
                  src={url}
                  muted={muted}
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                  // Tap video to toggle mute/unmute
                  onClick={() => setMuted((m) => !m)}
                />
              )}

              {isImage(url) && (
                <img
                  src={url}
                  alt="Evidence"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}

              {isAudio(url) && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow">
                    <p className="font-semibold text-slate-900">
                      Audio Evidence
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {ev.entity?.name || "Unknown Entity"}
                    </p>
                    <audio controls src={url} className="w-full mt-4" />
                  </div>
                </div>
              )}

              {/* Fallback for unknown file types */}
              {url && !isVideo(url) && !isImage(url) && !isAudio(url) && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow">
                    <p className="font-semibold text-slate-900">
                      Evidence File
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {ev.entity?.name || "Unknown Entity"}
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-4 text-indigo-600 underline text-sm"
                    >
                      View evidence file
                    </a>
                  </div>
                </div>
              )}

              {/* Top-right sound indicator (videos only) */}
              {isVideo(url) && (
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs z-10"
                >
                  {muted ? "🔇 Muted" : "🔊 Sound On"}
                </button>
              )}

              {/* Bottom overlay (metadata + actions) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent text-white">
                <a
                  href={`/ratings/${ev.entity?.id}`}
                  className="text-sm font-semibold text-indigo-200 hover:underline"
                >
                  {ev.entity?.name || "Unknown Entity"}
                </a>

                <p className="text-xs opacity-80 mt-1">
                  {ev.entity?.county || ""}
                  {ev.entity?.state ? `, ${ev.entity.state}` : ""}
                </p>

                {ev.description && (
                  <p className="text-sm mt-2 leading-snug">{ev.description}</p>
                )}

                <p className="text-xs opacity-70 mt-2">
                  Posted by {displayName(ev)} •{" "}
                  <span title={fullDate(ev.created_at)}>
                    {timeAgo(ev.created_at)}
                  </span>
                </p>

                <div className="mt-3">
                  <ShareButton
                    url={`/vault/public#evidence-${ev.id}`}
                    label="Share"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
