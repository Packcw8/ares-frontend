import { useState, useRef, useEffect } from "react";

export default function ShareButton({ url, label = "Share" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const fullUrl = url.startsWith("http")
    ? url
    : `${window.location.origin}${url}`;

  useEffect(() => {
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

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
    <div ref={ref} className="relative inline-block">
      {/* Primary Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="
          flex items-center gap-2
          rounded-full px-4 py-2
          bg-slate-900 text-white
          text-sm font-semibold
          shadow hover:bg-slate-800
          transition
        "
      >
        🔗 {label}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-48
            rounded-xl border bg-white
            shadow-lg z-50
            animate-in fade-in slide-in-from-top-1
          "
        >
          <button
            onClick={handleNativeShare}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            📱 Share via device
          </button>

          <button
            onClick={handleCopy}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            📋 {copied ? "Link copied" : "Copy link"}
          </button>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              fullUrl
            )}`}
            target="_blank"
            rel="noreferrer"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            🐦 Share on X
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              fullUrl
            )}`}
            target="_blank"
            rel="noreferrer"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            📘 Share on Facebook
          </a>
        </div>
      )}
    </div>
  );
}
