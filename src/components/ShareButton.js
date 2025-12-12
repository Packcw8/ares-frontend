import { useState } from "react";

export default function ShareButton({ url, label = "Share" }) {
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith("http")
    ? url
    : `${window.location.origin}${url}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ARES – Public Accountability",
          url: fullUrl,
        });
      } catch {}
    }
  };

  return (
    <div className="relative inline-flex gap-2">
      <button
        onClick={handleNativeShare}
        className="px-3 py-1 rounded-full border text-xs font-semibold hover:bg-gray-100"
      >
        🔗 {label}
      </button>

      <button
        onClick={handleCopy}
        className="px-3 py-1 rounded-full border text-xs font-semibold hover:bg-gray-100"
      >
        📋 {copied ? "Copied" : "Copy link"}
      </button>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          fullUrl
        )}`}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1 rounded-full border text-xs font-semibold hover:bg-gray-100"
      >
        🐦 X
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          fullUrl
        )}`}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1 rounded-full border text-xs font-semibold hover:bg-gray-100"
      >
        📘 FB
      </a>
    </div>
  );
}
