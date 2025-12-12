import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [userRole, setUserRole] = useState("");

  // 🔍 Search state
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
      } catch {
        // not logged in
      }
    };

    fetchPosts();
    fetchUser();
  }, []);

  // ✅ Match backend + DB roles exactly
  const canPostAsOfficial =
    userRole === "official_verified" || userRole === "admin";

  // 🔎 Unified search filter
  const filteredPosts = useMemo(() => {
    if (!query) return posts;

    const q = query.toLowerCase();

    return posts.filter((post) => {
      const entity = post.entity || {};

      return (
        post.title?.toLowerCase().includes(q) ||
        entity.name?.toLowerCase().includes(q) ||
        entity.state?.toLowerCase().includes(q) ||
        entity.county?.toLowerCase().includes(q)
      );
    });
  }, [posts, query]);

  return (
    <Layout>
      <div className="p-4 pb-24 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#283d63]">
            Public Statements & Discussion
          </h1>

          {canPostAsOfficial && (
            <Link
              to="/forum/new"
              className="bg-[#283d63] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#1d2c49] transition text-center"
            >
              + New Discussion
            </Link>
          )}
        </div>

        {/* 🔍 SEARCH BAR */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by entity, state, county, or topic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c2a76d] text-sm"
          />
        </div>

        {/* 🟡 Pending officials */}
        {userRole === "official_pending" && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-100 text-yellow-800">
            Your official account is under review. You may read and comment,
            but cannot start discussions yet.
          </div>
        )}

        {/* 📄 POSTS */}
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No discussions match your search.
          </p>
        ) : (
          <div className="space-y-5">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
              >
                {/* 🔗 ENTITY CONTEXT */}
                {post.entity && (
                  <div className="mb-3">
                    <Link
                      to={`/ratings/${post.entity.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      {post.entity.name}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {post.entity.county && `${post.entity.county} County, `}
                      {post.entity.state}
                    </div>
                  </div>
                )}

                {/* 🧵 TITLE */}
                <h2 className="text-xl font-semibold text-[#c2a76d] mb-1">
                  {post.title}
                </h2>

                {/* ⏱ META */}
                <div className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Forum;
