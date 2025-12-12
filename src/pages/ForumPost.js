import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function ForumPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/forum/${id}`).then((res) => setPost(res.data));
    api.get(`/comments/post/${id}`).then((res) => setComments(res.data));
  }, [id]);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post("/comments/", {
        post_id: parseInt(id),
        content: commentText,
      });

      setComments((prev) => [...prev, res.data]);
      setCommentText("");
      setError("");
    } catch {
      setError("You must be logged in to comment.");
    }
  };

  if (!post)
    return (
      <Layout>
        <p className="p-4">Loading...</p>
      </Layout>
    );

  return (
    <Layout>
      <div className="px-4 py-6 max-w-3xl mx-auto text-[#2c2c2c] font-serif">
        <h1 className="text-2xl font-extrabold text-[#283d63] mb-2">
          {post.title}
        </h1>

        <p className="text-sm italic text-[#5a4635] mb-4">
          Posted on {new Date(post.created_at).toLocaleDateString()}
        </p>

        <div className="bg-[#f5ecd9] p-4 rounded-xl shadow text-[#3a2f1b] whitespace-pre-wrap">
          {post.body}
        </div>

        <h2 className="mt-8 mb-2 text-lg font-bold text-[#283d63]">
          💬 Public Comments
        </h2>

        {comments.length === 0 ? (
          <p className="italic text-[#5a4635]">No comments yet.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {comments.map((c) => {
              const displayName =
                c.user?.username ||
                c.username ||
                "Anonymous";

              return (
                <div
                  key={c.id}
                  className="border-l-4 border-[#c2a76d] bg-[#fdf7ea] px-4 py-2 rounded"
                >
                  <p className="text-sm text-[#3a2f1b]">{c.content}</p>
                  <p className="text-xs text-[#7c6a4d] mt-1">
                    {displayName} •{" "}
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <textarea
            rows="4"
            className="w-full border border-[#c2a76d] p-2 rounded-md text-sm font-serif"
            placeholder="Write your comment here..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

          <button
            onClick={handleSubmit}
            className="mt-2 bg-[#283d63] text-white px-4 py-2 rounded hover:bg-[#1d2c49] transition"
          >
            Submit Comment
          </button>
        </div>
      </div>
    </Layout>
  );
}
