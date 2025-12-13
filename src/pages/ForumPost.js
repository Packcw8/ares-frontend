import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import ShareButton from "../components/ShareButton";
import { timeAgo, fullDate } from "../utils/time";

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
      <div className="px-4 py-8 max-w-3xl mx-auto text-[#1f1f1f]">

        {/* NAV */}
        <div className="mb-4 text-sm flex justify-between items-center">
          <Link
            to="/forum"
            className="text-blue-700 hover:underline font-medium"
          >
            ← Back to Forum
          </Link>

          {/* SHARE */}
          <ShareButton
            url={`/forum/${id}`}
            label="Share discussion"
          />
        </div>

        {/* POST CARD */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-[#283d63] mb-2">
            {post.title}
          </h1>

          <p
            className="text-xs text-gray-500 mb-4"
            title={fullDate(post.created_at)}
          >
            Posted {timeAgo(post.created_at)}
          </p>

          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
            {post.body}
          </div>
        </div>

        {/* COMMENTS */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[#283d63] mb-4">
            Discussion
          </h2>

          {comments.length === 0 ? (
            <p className="italic text-gray-500">
              No comments yet. Be the first to respond.
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => {
                const displayName =
                  c.user?.username ||
                  c.username ||
                  "Anonymous";

                return (
                  <div
                    key={c.id}
                    className="bg-[#faf8f2] border border-[#e5dcc3] rounded-xl p-4"
                  >
                    <p className="text-sm text-gray-800">
                      {c.content}
                    </p>
                    <p
                      className="text-xs text-gray-500 mt-2"
                      title={fullDate(c.created_at)}
                    >
                      {displayName} • {timeAgo(c.created_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COMMENT INPUT */}
        <div className="mt-8 bg-[#f5f3ee] border border-[#e0d8c4] rounded-2xl p-4">
          <textarea
            rows="4"
            className="w-full border border-[#c2a76d] p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c2a76d]"
            placeholder="Write a thoughtful response…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          {error && (
            <p className="text-red-600 text-sm mt-1">{error}</p>
          )}

          <div className="text-right mt-2">
            <button
              onClick={handleSubmit}
              className="bg-[#283d63] text-white px-5 py-2 rounded-xl hover:bg-[#1d2c49] transition font-semibold"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
