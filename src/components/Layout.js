import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import aresLogo from "../assets/areslogo.png";
import { constitutionalQuotes } from "../data/constitutionalQuotes";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const showReportButton = location.pathname === "/home";
  const showLogout = location.pathname !== "/login" && location.pathname !== "/signup";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const randomQuote = constitutionalQuotes[Math.floor(Math.random() * constitutionalQuotes.length)];

  return (
    <div className="min-h-screen bg-[#f5ecd9] text-[#2c2c2c] font-serif px-4 py-6 pb-36 max-w-5xl mx-auto border-y-4 border-[#c2a76d] shadow-inner">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-[#c2a76d] pb-4 gap-4">
        <div className="flex items-center space-x-4">
          <img src={aresLogo} alt="ARES" className="h-12 w-12 border border-[#3a2f1b] rounded-full shadow-sm" />
          <div>
            <h1 className="text-4xl font-extrabold text-[#3a2f1b] tracking-wide">ARES</h1>
            <p className="text-sm italic text-[#5a4635]">
              “{randomQuote.quote}” — {randomQuote.author}
            </p>
          </div>
        </div>

        {showLogout && (
          <button
            onClick={handleLogout}
            className="bg-[#283d63] hover:bg-[#1c2b4a] text-white border border-[#c2a76d] py-2 px-5 rounded-md shadow font-bold text-sm tracking-wider uppercase transition duration-300"
          >
            🇺🇸 Logout
          </button>
        )}
      </header>

      {showReportButton && (
        <div className="mb-6">
          <button className="w-full bg-[#8b1e3f] hover:bg-[#72162f] text-white py-3 px-6 rounded text-lg font-bold transition uppercase tracking-wider shadow">
            Submit a Report
          </button>
        </div>
      )}

      <div className="
        grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4

        [&_input]:w-full
        [&_input]:bg-[#ede3cb]
        [&_input]:text-[#1e1e1e]
        [&_input]:border
        [&_input]:border-[#9b8b6d]
        [&_input]:rounded-md
        [&_input]:px-4
        [&_input]:py-2
        [&_input]:font-serif
        [&_input]:focus:outline-none
        [&_input]:focus:ring-2
        [&_input]:focus:ring-[#c2a76d]
        [&_input]:placeholder:text-[#5a4635]

        [&_select]:w-full
        [&_select]:bg-[#ede3cb]
        [&_select]:text-[#1e1e1e]
        [&_select]:border
        [&_select]:border-[#9b8b6d]
        [&_select]:rounded-md
        [&_select]:px-4
        [&_select]:py-2
        [&_select]:font-serif
        [&_select]:focus:outline-none
        [&_select]:focus:ring-2
        [&_select]:focus:ring-[#c2a76d]
        [&_select]:placeholder:text-[#5a4635]

        [&_textarea]:w-full
        [&_textarea]:bg-[#ede3cb]
        [&_textarea]:text-[#1e1e1e]
        [&_textarea]:border
        [&_textarea]:border-[#9b8b6d]
        [&_textarea]:rounded-md
        [&_textarea]:px-4
        [&_textarea]:py-2
        [&_textarea]:font-serif
        [&_textarea]:focus:outline-none
        [&_textarea]:focus:ring-2
        [&_textarea]:focus:ring-[#c2a76d]
        [&_textarea]:placeholder:text-[#5a4635]

        [&_button[type='submit']]:bg-[#8b1e3f]
        [&_button[type='submit']]:hover:bg-[#72162f]
        [&_button[type='submit']]:text-white
        [&_button[type='submit']]:border
        [&_button[type='submit']]:border-[#c2a76d]
        [&_button[type='submit']]:font-serif
        [&_button[type='submit']]:font-bold
        [&_button[type='submit']]:uppercase
        [&_button[type='submit']]:tracking-wide
        [&_button[type='submit']]:py-2
        [&_button[type='submit']]:px-6
        [&_button[type='submit']]:rounded-md
        [&_button[type='submit']]:shadow
        [&_button[type='submit']]:transition
        [&_button[type='submit']]:duration-300

        [&_button]:bg-[#283d63]
        [&_button]:hover:bg-[#1c2b4a]
        [&_button]:text-white
        [&_button]:font-bold
        [&_button]:rounded-md
        [&_button]:px-4
        [&_button]:py-2
        [&_button]:shadow
        [&_button]:transition
        [&_button]:duration-300

        [&_a.card]:block
        [&_a.card]:bg-[#ede3cb]
        [&_a.card]:border
        [&_a.card]:border-[#c2a76d]
        [&_a.card]:rounded-xl
        [&_a.card]:p-4
        [&_a.card]:shadow-md
        [&_a.card]:hover:bg-[#e2d5b7]
        [&_a.card]:transition
        [&_a.card]:duration-200

        [&_.card]:bg-[#ede3cb]
        [&_.card]:text-[#2c2c2c]
        [&_.card]:border
        [&_.card]:border-[#c2a76d]
        [&_.card]:rounded-xl
        [&_.card]:p-4
        [&_.card]:shadow-md
        [&_.card]:transition
        [&_.card]:duration-200
        [&_.card]:hover:bg-[#e6d6b7]
      ">
        {children}
      </div>

      {showLogout && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#3a2f1b] text-white border-t border-[#c2a76d] flex justify-around items-center py-4 px-2 z-50 text-base space-x-2 shadow-lg">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 rounded-md text-center hover:bg-[#4b3822] transition"
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => navigate("/ratings")}
            className="flex-1 py-3 rounded-md text-center hover:bg-[#4b3822] transition"
          >
            ⭐ Ratings
          </button>
          <button
            onClick={() => navigate("/ratings/new")}
            className="flex-1 py-3 rounded-md text-center hover:bg-[#4b3822] transition"
          >
            ➕ Add
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 py-3 rounded-md text-center hover:bg-[#4b3822] transition"
          >
            📄 Report
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-3 rounded-md text-center hover:bg-[#4b3822] transition"
          >
            🚪 Logout
          </button>
        </nav>
      )}

      <footer className="mt-10 text-center text-xs text-[#5a4635] italic border-t border-[#c2a76d] pt-4">
        © 2025 ARES – Upholding Justice, Defending the Constitution.
      </footer>
    </div>
  );
}
