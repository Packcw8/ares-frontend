import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import ShareButton from "../components/ShareButton";
import { timeAgo, fullDate, dateGroup } from "../utils/time";
import { displayName } from "../utils/displayName";

export default function VaultPublic() {
  const [recordList, setRecordList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/vault/feed")
      .then((res) => {
        // ✅ SAFE NORMALIZATION (media may be missing)
        const normalized = (res.data || []).map((ev) => ({
          ...ev,
          media_url: ev.blob_url || ev.media_url || null,
        }));
        setRecordList(normalized);
      })
      .catch((err) =>
        console.error("Failed to load public records", err)
      )
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     SEARCH FILTER
     ========================= */
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recordList;

    return recordList.filter((rec) => {
      const entity = rec.entity || {};
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
  }, [search, recordList]);

  let lastDateLabel = null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Public Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Community-submitted records for transparency and accountability
          </p>

          {/* INFO CALLOUT */}
          <div className="mt-3 inline-flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">
              What is this?
            </span>
            <span>
              Public Records are user-submitted media or written accounts
              preserved to document experiences involving public entities or
              officials. Submissions reflect personal perspectives and are
              moderated for policy compliance.
            </span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by state, county, or entity…"
            className="
              w-full
              rounded-2xl
              bg-slate-50
              border
              border-slate-200
              px-5
              py-3
              text-sm
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
            "
          />
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-slate-500">
            Loading public records…
          </p>
        )}

        {/* EMPTY SEARCH STATE */}
        {!loading && search.trim() && filteredRecords.length === 0 && (
          <div className="mt-16 flex justify-center">
            <div className="max-w-xl w-full rounded-3xl border border-slate-200 bg-slate-50 px-8 py-10 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                No public records found
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                There are currently no public records matching{" "}
                <span className="font-medium">“{search}”</span>.
                You may be the first to preserve a public record for
                transparency.
              </p>

              <button
                onClick={() => navigate("/vault/upload")}
                className="
                  mt-6
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:bg-slate-100
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
              >
                + Submit a Public Record
              </button>
            </div>
          </div>
        )}

        {/* RECORD FEED */}
        <div className="space-y-12">
          {filteredRecords.map((rec) => {
            const dateLabel = dateGroup(rec.created_at);
            const showDate =
              dateLabel && dateLabel !== lastDateLabel;
            if (showDate) lastDateLabel = dateLabel;

            return (
              <div key={rec.id} id={`record-${rec.id}`}>
                {showDate && (
                  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur py-2 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {dateLabel}
                    </p>
                  </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* ENTITY HEADER */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <a
                      href={`/ratings/${rec.entity?.id}`}
                      className="text-sm font-semibold text-indigo-700 hover:underline"
                    >
                      {rec.entity?.name || "Unknown Entity"}
                    </a>

                    <p className="text-xs text-slate-500">
                      {rec.entity?.county || ""}
                      {rec.entity?.state
                        ? `, ${rec.entity.state}`
                        : ""}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Submitted by{" "}
                      <span className="font-medium">
                        {displayName(rec)}
                      </span>
                    </p>
                  </div>

                  {/* MEDIA (OPTIONAL) */}
                  <div className="bg-black">
                    {rec.media_url &&
                      rec.media_url.match(/\.(mp4|webm)$/i) && (
                        <video
                          controls
                          preload="metadata"
                          src={rec.media_url}
                          className="w-full max-h-[75vh] object-contain"
                        />
                      )}

                    {rec.media_url &&
                      rec.media_url.match(
                        /\.(jpe?g|png|gif)$/i
                      ) && (
                        <img
                          src={rec.media_url}
                          alt="Public record media"
                          className="w-full max-h-[75vh] object-contain"
                        />
                      )}

                    {rec.media_url &&
                      rec.media_url.match(/\.(mp3|wav)$/i) && (
                        <audio
                          controls
                          src={rec.media_url}
                          className="w-full"
                        />
                      )}

                    {rec.media_url &&
                      !rec.media_url.match(
                        /\.(mp4|webm|jpe?g|png|gif|mp3|wav)$/i
                      ) && (
                        <div className="p-4 bg-slate-100">
                          <a
                            href={rec.media_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 underline text-sm"
                          >
                            View attached record
                          </a>
                        </div>
                      )}
                  </div>

                  {/* DESCRIPTION */}
                  {rec.description && (
                    <div className="px-6 py-5">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="px-6 pb-5 flex justify-between items-center">
                    <ShareButton
                      url={`/vault/public#record-${rec.id}`}
                      label="Share record"
                    />
                    <span
                      className="text-xs text-slate-400"
                      title={fullDate(rec.created_at)}
                    >
                      Submitted {timeAgo(rec.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
