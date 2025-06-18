import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function NewForumPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isAMA, setIsAMA] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forum/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          tags,
          is_pinned: isPinned,
          is_ama: isAMA,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post");
      }

      navigate("/forum");
    } catch (err) {
      console.error(err);
      alert("Error creating post.");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-[#c2a76d]">
        Start a New Discussion
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Title</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Content</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-xl"
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-xl"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            Pin this post
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAMA}
              onChange={(e) => setIsAMA(e.target.checked)}
            />
            Mark as AMA
          </label>
        </div>

        <button
          type="submit"
          className="bg-[#c2a76d] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#b08d5d] transition"
        >
          Submit Post
        </button>
      </form>
    </div>
  );
}

export default NewForumPost;
