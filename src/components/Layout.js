import React from 'react';
import { useLocation } from 'react-router-dom';
import aresLogo from "../assets/areslogo.png"; // ✅ import logo

export default function Layout({ children }) {
  const location = useLocation();
  const showReportButton = location.pathname === "/home";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B1B1B] to-[#0F0F0F] text-white font-serif px-4 py-6 max-w-3xl mx-auto border-t-8 border-b-8 border-blue-700">
      <header className="flex justify-between items-center mb-8 border-b border-red-800 pb-4">
        <div className="flex items-center space-x-4">
          <img src={aresLogo} alt="ARES" className="h-12 w-12 border border-white rounded-full shadow-md" />
          <div>
            <h1 className="text-4xl font-extrabold text-red-600 tracking-wide">ARES</h1>
            <p className="text-sm text-gray-300 italic">
              “A Republic, if you can keep it.” — Empowering Constitutional Accountability
            </p>
          </div>
        </div>
      </header>

      {showReportButton && (
        <div className="mb-6">
          <button className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 px-6 rounded text-lg font-bold transition uppercase tracking-wider shadow-md">
            Submit a Report
          </button>
        </div>
      )}

      {children}

      <footer className="mt-10 text-center text-xs text-gray-400 italic border-t border-gray-700 pt-4">
        © 2025 ARES – Upholding Justice, Defending the Constitution.
      </footer>
    </div>
  );
}
