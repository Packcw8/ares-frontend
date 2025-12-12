import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import ShareButton from "../components/ShareButton";

const TYPE_COLORS = {
  police: "bg-blue-100 text-blue-800",
  court: "bg-purple-100 text-purple-800",
  cps: "bg-red-100 text-red-800",
  agency: "bg-gray-100 text-gray-800",
  individual: "bg-green-100 text-green-800",
};

function Forum() {
  const [posts, setPosts] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/forum/").then((res) => setPosts(res.data));
    api.get("/auth/me")
      .then((res) => setUserRole(res.data.role))
      .catch(() => {});
  }, []);

  const canPost =
    userRole === "official_verified" || userRole === "admin";

  const filteredPosts = useMemo(() => {
    if (!query) return posts;
    const q = query.toLowerCase();
    return posts.filter((p) =>
      p.title?.toLowerCase().includes(q) ||
      p.body?.toLowerCase().includes(q) ||
      p.entity?.name?.toLowerCase().includes(q) ||
      p.entity?.state?.toLowerCase().includes(q) ||
      p.entity?.county?.toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <Layout>
      <div className="px-4 pb-24 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#283d63]">
            Public Statements & Forums
          </h1>

          {canPost && (
            <Link
              to="/forum/new"
              className="bg-[#283d63] text-white px-5 py-2 rounded-xl font-semibold hover:bg-[#1d2c49]"
            >
              + New Discussion
            </Link>
          )}
        </div>

        {/* SEARCH */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by entity, state, county, or topic…"
          className="w-full mb-8 px-5 py-3 rounded-2xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c2a76d]"
        />

        {/* GRID */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="mb-6 break-inside-avoid">
              <div className="block bg-white rounded-2xl border p-4 shadow-sm hover:shadow-lg hover:border-[#c2a76d] transition">

                {/* ENTITY HEADER */}
                {post.entity && (
                  <div className="mb-2 flex justify-between items-start gap-2">
                    <div>
                      <Link
                        to={`/ratings/${post.entity.id}`}
                        className="text-xs font-bold uppercase tracking-wide text-blue-700 hover:underline"
                      >
                        {post.entity.name}
                      </Link>
                      <div className="text-[11px] text-gray-500">
                        {post.entity.state}
                        {post.entity.county && ` • ${post.entity.county} County`}
                      </div>
                    </div>

                    {post.entity.type && (
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                          TYPE_COLORS[post.entity.type] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {post.entity.type.toUpperCase()}
                      </span>
                    )}
                  </div>
                )}

                {/* TITLE */}
                <Link to={`/forum/${post.id}`}>
                  <h2 className="text-base font-semibold text-[#c2a76d] mb-1 line-clamp-2 hover:underline">
                    {post.title}
                  </h2>
                </Link>

                {/* BODY PREVIEW */}
                {post.body && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {post.body}
                  </p>
                )}

                {/* META + SHARE */}
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {post.verified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-semibold">
                        Verified
                      </span>
                    )}
                    <span>💬 {post.comment_count ?? 0}</span>
                  </div>
                </div>

                {/* SHARE */}
                <div className="mt-3">
                  <ShareButton url={`/forum/${post.id}`} />
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Forum;
