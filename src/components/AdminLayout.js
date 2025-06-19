import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import aresLogo from "../assets/areslogo.png";
import { constitutionalQuotes } from "../data/constitutionalQuotes";
import AdminBottomNav from "./AdminBottomNav"; // ⬅️ Use the admin nav

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const randomQuote = useMemo(() => {
    return constitutionalQuotes[Math.floor(Math.random() * constitutionalQuotes.length)];
  }, []);

  return (
    <div className="min-h-screen bg-[#f5ecd9] text-[#2c2c2c] font-serif px-4 py-6 pb-36 max-w-5xl mx-auto border-y-4 border-[#c2a76d] shadow-inner">
      {/* Admin Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-[#c2a76d] pb-4 gap-4">
        <div className="flex items-center space-x-4">
          <img src={aresLogo} alt="ARES" className="h-12 w-12 border border-[#3a2f1b] rounded-full shadow-sm" />
          <div>
            <h1 className="text-4xl font-extrabold text-[#3a2f1b] tracking-wide">ARES Admin</h1>
            <p className="text-sm italic text-[#5a4635]">
              “{randomQuote.quote}” — {randomQuote.author}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-[#283d63] hover:bg-[#1c2b4a] text-white border border-[#c2a76d] py-2 px-5 rounded-md shadow font-bold text-sm tracking-wider uppercase transition duration-300"
        >
          🛑 Logout
        </button>
      </header>

      {/* Page Content */}
      <div className="grid grid-cols-1 gap-4 [&_input], [&_select], [&_textarea] text-style-constitution [&_button]:constitution-btn [&_.card]:constitution-card">
        {children}
      </div>

      <AdminBottomNav />

      <footer className="mt-10 text-center text-xs text-[#5a4635] italic border-t border-[#c2a76d] pt-4">
        © 2025 ARES Admin – Oversight Powered by the People.
      </footer>
    </div>
  );
}
