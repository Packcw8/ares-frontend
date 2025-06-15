import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-gray-900 font-sans px-4 py-6 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-[#0A2A42]">ARES</h1>
        <button className="text-[#0A2A42]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </header>
      {children}
    </div>
  );
}
