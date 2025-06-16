import React from 'react';

export default function Layout({ children }) {
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

      <div className="mb-6">
        <button className="w-full bg-red-700 hover:bg-red-800 text-white py-3 px-6 rounded text-lg font-bold transition">
          SUBMIT A REPORT
        </button>
      </div>

      <div className="mb-8">
        <label className="block mb-2 text-lg font-semibold">Rate an Official</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for Official"
            className="w-full px-4 py-2 rounded bg-gray-900 text-white placeholder-gray-400"
          />
          <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {children}

      <footer className="mt-10 text-center text-sm text-gray-500">
        ARES – Public Accountability Powered by You.
      </footer>
    </div>
  );
}
