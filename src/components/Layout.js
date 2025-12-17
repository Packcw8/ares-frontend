import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import aresLogo from "../assets/areslogo.png";
import { constitutionalQuotes } from "../data/constitutionalQuotes";
import BottomNav from "./BottomNav";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  const [showMenu, setShowMenu] = useState(false);

  const showBottomNav = !["/login", "/signup"].includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const randomQuote = useMemo(
    () =>
      constitutionalQuotes[
        Math.floor(Math.random() * constitutionalQuotes.length)
      ],
    []
  );

  return (
    <div className="min-h-screen bg-[#f5ecd9] text-[#2c2c2c] font-serif relative">
      {/* 🔒 FIXED GLOBAL HAMBURGER */}
      {isAuthenticated && (
        <>
          <button
            onClick={() => setShowMenu((v) => !v)}
            aria-label="Menu"
            className="
              fixed
              top-4
              right-4
              z-[9999]
              h-11
              w-11
              rounded-full
              bg-[#2c1b0f]
              border
              border-[#c2a76d]
              text-[#f5ecd9]
              text-2xl
              flex
              items-center
              justify-center
              shadow-xl
            "
          >
            ☰
          </button>

          {showMenu && (
            <div
              className="
                fixed
                top-20
                right-4
                z-[9999]
                w-64
                bg-[#f5ecd9]
                border
                border-[#c2a76d]
                rounded-xl
                shadow-2xl
                p-2
                space-y-1
              "
            >
              {[
                { label: "About ARES", path: "/about", icon: "🏛️" },
                { label: "Know Your Rights", path: "/rights", icon: "⚖️" },
                { label: "Community Rules", path: "/rules", icon: "📜" },
                { label: "Privacy Policy", path: "/privacy", icon: "📄" },
                { label: "Terms of Use", path: "/terms", icon: "🛡️" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowMenu(false);
                    navigate(item.path);
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-lg
                    text-left
                    text-[#3a2f1b]
                    hover:bg-[#ede3cb]
                    text-base
                  "
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}

              <hr className="my-2 border-[#c2a76d]" />

              <button
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-lg
                  text-left
                  text-red-700
                  hover:bg-red-100
                  text-base
                  font-medium
                "
              >
                🚪 Logout
              </button>
            </div>
          )}
        </>
      )}

      {/* PAGE CONTENT */}
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4 sm:px-6 lg:px-10
          pt-6
          pb-28 md:pb-10
        "
      >
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-[#c2a76d] pb-4">
          <div className="flex items-center gap-4">
            <img
              src={aresLogo}
              alt="ARES"
              className="h-12 w-12 rounded-full border border-[#3a2f1b] shadow-sm"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#3a2f1b] tracking-wide">
                ARES
              </h1>
              <p className="text-xs md:text-sm italic text-[#5a4635] max-w-xl">
                “{randomQuote.quote}” — {randomQuote.author}
              </p>
            </div>
          </div>
        </header>

        <main className="space-y-6">{children}</main>

        <footer className="mt-12 border-t border-[#c2a76d] pt-6 text-center text-xs text-[#5a4635] space-y-3">
          <p className="opacity-80">
            © 2025 ARES — Upholding Justice, Defending the Constitution.
          </p>
        </footer>
      </div>

      {/* MOBILE NAV */}
      {isAuthenticated && showBottomNav && <BottomNav />}
    </div>
  );
}
