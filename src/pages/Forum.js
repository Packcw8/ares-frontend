import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Forum() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/forum")
      .then(res => setPosts(res.data))
      .catch(() => console.warn("Failed to fetch posts"));
  }, []);

  return (
    <Layout>
      <div className="px-4 py-6 max-w-3xl mx-auto text-[#2c2c2c] font-serif">
        <h1 className="text-3xl font-extrabold text-[#283d63] uppercase border-b border-[#c2a76d] pb-2 mb-6">
          🗣️ Official Public Forum
        </h1>

        {posts.length === 0 ? (
          <p className="text-[#5a4635] italic">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="block border border-[#c2a76d] bg-[#f5ecd9] p-4 rounded-xl shadow hover:bg-[#ede3cb] transition"
              >
                <h2 className="text-xl font-bold text-[#3a2f1b]">{post.title}</h2>
                <p className="text-sm text-[#5a4635] mt-1">
                  Posted by Official #{post.author_id} on {new Date(post.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
