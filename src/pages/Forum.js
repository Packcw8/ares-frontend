import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function Forum() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/forum");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching forum posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4 text-[#283d63]">Public Forum</h1>

        <div className="mb-4 text-right">
          <Link
            to="/forum/new"
            className="bg-[#c2a76d] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#b08d5d] transition"
          >
            + Start a New Discussion
          </Link>
        </div>

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
                By user {post.author_id} •{" "}
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
