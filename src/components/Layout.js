import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const showReportButton = location.pathname === "/home";

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans px-4 py-6 max-w-3xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <img src="/microscope-icon.png" alt="ARES" className="h-10 w-10" />
          <div>
            <h1 className="text-3xl font-extrabold">ARES</h1>
            <p className="text-sm text-gray-400">Expose government misconduct and enable public accountability.</p>
          </div>
        </div>
      </header>

      {/* Only show the button on specific routes */}
      {showReportButton && (
        <div className="mb-6">
          <button className="w-full bg-red-700 hover:bg-red-800 text-white py-3 px-6 rounded text-lg font-bold transition">
            SUBMIT A REPORT
          </button>
        </div>
      )}

      {children}

      <footer className="mt-10 text-center text-sm text-gray-500">
        ARES – Public Accountability Powered by You.
      </footer>
    </div>
  );
}
