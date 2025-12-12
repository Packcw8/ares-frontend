import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [isVerified, setIsVerified] = useState(false);

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
        setIsVerified(res.data.is_verified);
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

  return (
    <Layout>
      <div className="p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4 text-[#283d63]">
          Hear From Officials. Join the Conversation.
        </h1>

        {/* 🟡 Pending officials */}
        {userRole === "official_pending" && (
          <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800">
            Your official account is under review. You may read and comment,
            but cannot start discussions yet.
          </div>
        )}

        {/* ✅ Verified officials + admins */}
        {canPostAsOfficial && (
          <div className="mb-4 text-right">
            <Link
              to="/forum/new"
              className="bg-[#c2a76d] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#b08d5d] transition"
            >
              + Start a New Discussion
            </Link>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              to={`/forum/${post.id}`}
              className="block border border-gray-200 p-4 rounded-xl shadow-md mb-4 bg-white hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-[#c2a76d]">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500">
                By Official #{post.author_id} •{" "}
                {new Date(post.created_at).toLocaleString()}
              </p>
            </Link>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Forum;
