import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import aresLogo from "../assets/areslogo.png";
import { constitutionalQuotes } from "../data/constitutionalQuotes";
import BottomNav from "./BottomNav";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  const [showMenu, setShowMenu] = useState(false);
  const [showHamburger, setShowHamburger] = useState(true);

  const hideHamburgerRoutes = ["/login", "/signup"];

  const shouldShowHamburger =
    isAuthenticated &&
    showHamburger &&
    !hideHamburgerRoutes.includes(location.pathname);

  const showBottomNav =
    isAuthenticated && !hideHamburgerRoutes.includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setShowHamburger(window.scrollY < 48);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showHamburger) setShowMenu(false);
  }, [showHamburger]);

  const randomQuote = useMemo(
    () =>
      constitutionalQuotes[
        Math.floor(Math.random() * constitutionalQuotes.length)
      ],
    []
  );

  const menuItems = [
    { label: "About ARES", route: "/about" },
    { label: "Know Your Rights", route: "/knowYourRights" },
    { label: "Community Rules", route: "/RulesPage" },
    { label: "Privacy Policy", route: "/privacypolicy" },
    { label: "Terms of Use", route: "/termsofuse" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f5ef] to-[#efe9dc] text-slate-900 relative font-sans">
      {/* HAMBURGER (AUTH ONLY) */}
      {shouldShowHamburger && (
        <>
          <button
            onClick={() => setShowMenu(true)}
            aria-label="Open menu"
            className="fixed top-4 right-4 z-[10000] h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg transition hover:scale-105"
          >
            ☰
          </button>

          {showMenu && (
            <div className="fixed inset-0 z-[9999]">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowMenu(false)}
              />

              <div className="absolute top-20 right-4 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.route}
                    onClick={() => {
                      setShowMenu(false);
                      navigate(item.route);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-100"
                  >
                    {item.label}
                  </button>
                ))}

                <hr className="my-2" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* PAGE WRAPPER */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 pt-6 pb-28 md:pb-10">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src={aresLogo}
              alt="ARES"
              className="h-12 w-12 rounded-full shadow-md"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                ARES
              </h1>
              <p className="text-xs md:text-sm text-slate-600 italic max-w-xl">
                “{randomQuote.quote}” — {randomQuote.author}
              </p>
            </div>
          </div>
        </header>

        {/* PUBLIC CTA (NOT LOGGED IN) */}
        {!isAuthenticated && (
          <div className="mb-10 rounded-2xl border border-[#c2a76d]/40 bg-white/70 backdrop-blur p-6 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#283d63] mb-2">
              Create an account for free
            </h2>
            <p className="text-sm text-slate-600 mb-4 max-w-xl mx-auto">
              Document experiences, protect your rights, and contribute to public
              accountability — without fear or paywalls.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2 rounded-xl bg-[#283d63] text-white font-semibold hover:bg-[#1f2f4f] transition"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
              >
                Log In
              </button>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <main className="space-y-6">{children}</main>

        {/* FOOTER */}
        <footer className="mt-14 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 space-y-2">
          <p>© 2025 ARES — Accountability through transparency.</p>
        </footer>
      </div>

      {/* MOBILE NAV (AUTH ONLY) */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
