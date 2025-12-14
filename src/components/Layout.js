import React, { useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import aresLogo from "../assets/areslogo.png";
import { constitutionalQuotes } from "../data/constitutionalQuotes";
import BottomNav from "./BottomNav";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  const showLogout = !["/login", "/signup"].includes(location.pathname);
  const showReportButton = location.pathname === "/home";

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
    <div className="min-h-screen bg-[#f5ecd9] text-[#2c2c2c] font-serif">
      {/* PAGE WRAPPER */}
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
        {/* 🔔 GUEST MODE CTA */}
        {!isAuthenticated && showLogout && (
          <div className="mb-4 rounded border border-[#c2a76d] bg-[#fffaf0] px-4 py-3 text-center text-sm text-[#3a2f1b]">
            <span className="mr-2 font-semibold">
              You’re viewing as a guest.
            </span>
            <Link
              to={`/signup?returnTo=${location.pathname}`}
              className="underline font-bold"
            >
              Create a free account
            </Link>
            <span className="ml-1">
              to rate officials, comment, or upload evidence.
            </span>
          </div>
        )}

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

          {/* DESKTOP LOGOUT */}
          {showLogout && isAuthenticated && (
            <button
              onClick={handleLogout}
              className="
                hidden md:flex
                items-center
                bg-[#283d63]
                hover:bg-[#1c2b4a]
                text-white
                border border-[#c2a76d]
                px-5 py-2
                rounded-md
                shadow
                font-bold
                text-sm
                uppercase
                tracking-wider
              "
            >
              🇺🇸 Logout
            </button>
          )}
        </header>

        {/* REPORT CTA */}
        {showReportButton && isAuthenticated && (
          <div className="mb-6">
            <button className="w-full md:w-auto bg-[#8b1e3f] hover:bg-[#72162f] text-white py-3 px-6 rounded text-lg font-bold shadow uppercase tracking-wider">
              Submit a Report
            </button>
          </div>
        )}

        {/* CONTENT */}
        <main className="space-y-6">{children}</main>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-[#c2a76d] pt-6 text-center text-xs text-[#5a4635] space-y-3">
          <div className="flex justify-center gap-4 font-semibold">
            <Link to="/about" className="hover:underline">
              About ARES
            </Link>
            <span>•</span>
            <Link to="/rights" className="hover:underline">
              Know Your Rights
            </Link>
            <span>•</span>
            <Link to="/rules" className="hover:underline">
              Community Rules
            </Link>
          </div>

          <p className="max-w-3xl mx-auto italic">
            ARES is a public transparency platform. Content is user-generated
            and does not constitute legal findings or determinations of guilt.
            ARES does not replace courts, law enforcement, or legal counsel.
          </p>

          <p className="opacity-80">
            © 2025 ARES — Upholding Justice, Defending the Constitution.
          </p>
        </footer>
      </div>

      {/* MOBILE NAV ONLY */}
      {showLogout && <BottomNav />}
    </div>
  );
}
