import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/forum/");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching forum posts:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUserRole(res.data.role);
      } catch {}
    };

    fetchPosts();
    fetchUser();
  }, []);

  const canPostAsOfficial =
    userRole === "official_verified" || userRole === "admin";

  // 🔍 Unified search across entity + location + title + body
  const filteredPosts = useMemo(() => {
    if (!query) return posts;
    const q = query.toLowerCase();

    return posts.filter((post) => {
      const entity = post.entity || {};
      return (
        post.title?.toLowerCase().includes(q) ||
        post.body?.toLowerCase().includes(q) ||
        entity.name?.toLowerCase().includes(q) ||
        entity.state?.toLowerCase().includes(q) ||
        entity.county?.toLowerCase().includes(q)
      );
    });
  }, [posts, query]);

  return (
    <Layout>
      <div className="px-4 pb-24 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#283d63]">
            Public Statements & Forums
          </h1>

          {canPostAsOfficial && (
            <Link
              to="/forum/new"
              className="bg-[#283d63] text-white px-5 py-2 rounded-xl font-semibold hover:bg-[#1d2c49] transition text-center"
            >
              + New Discussion
            </Link>
          )}
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by entity, official, state, county, or topic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c2a76d] text-sm"
          />
        </div>

        {/* PENDING NOTICE */}
        {userRole === "official_pending" && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-100 text-yellow-800">
            Your official account is under review. You may read and comment,
            but cannot start discussions yet.
          </div>
        )}

        {/* 🧱 PINTEREST / MASONRY GRID */}
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No discussions match your search.
          </p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="mb-6 break-inside-avoid">
                <Link
                  to={`/forum/${post.id}`}
                  className="
                    block bg-white
                    rounded-2xl
                    border border-gray-200
                    p-4
                    shadow-sm
                    hover:shadow-lg
                    hover:border-[#c2a76d]
                    transition
                  "
                >
                  {/* ENTITY + CONTEXT */}
                  {post.entity && (
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/ratings/${post.entity.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold uppercase tracking-wide text-blue-700 hover:underline"
                        >
                          {post.entity.name}
                        </Link>
                        <div className="text-[11px] text-gray-500">
                          {post.entity.state}
                          {post.entity.county &&
                            ` • ${post.entity.county} County`}
                        </div>
                      </div>

                      {/* TYPE CHIP */}
                      <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold">
                        Forum
                      </span>
                    </div>
                  )}

                  {/* TITLE */}
                  <h2 className="text-base font-semibold text-[#c2a76d] leading-snug mb-1 line-clamp-2">
                    {post.title}
                  </h2>

                  {/* BODY PREVIEW */}
                  {post.body && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.body}
                    </p>
                  )}

                  {/* META */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      💬 {post.comment_count ?? 0} comments
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Forum;
