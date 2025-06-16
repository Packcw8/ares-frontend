import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [verifiedCount] = useState(245);      // Replace with real data later
  const [unverifiedCount] = useState(68);     // Replace with real data later

  return (
    <Layout>
      <div className="space-y-8">
        {/* Search / Rating Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Rate an Official</h2>
          <div className="flex items-center justify-center">
            <input
              type="text"
              placeholder="Search for Official"
              className="w-full max-w-md px-4 py-2 rounded-lg bg-[#1e1e1e] text-white placeholder-gray-400 border border-gray-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Corruption Heatmap Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">Corruption Heatmap</h3>
          <img
            src="/map-placeholder.png"
            alt="Corruption Heatmap"
            className="w-full rounded-xl shadow-md"
          />
        </div>

        {/* Stats Section */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="bg-[#1c1c1c] px-6 py-4 rounded-lg text-center shadow">
            <h4 className="text-3xl font-extrabold">{verifiedCount}</h4>
            <p className="text-sm text-gray-400 mt-1 uppercase">Verified Reports</p>
          </div>
          <div className="bg-[#1c1c1c] px-6 py-4 rounded-lg text-center shadow">
            <h4 className="text-3xl font-extrabold">{unverifiedCount}</h4>
            <p className="text-sm text-gray-400 mt-1 uppercase">Unverified Reports</p>
          </div>
        </div>

        {/* Ratings Page Link */}
        <div className="text-center">
          <Link
            to="/ratings"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition"
          >
            View Public Ratings →
          </Link>
        </div>
      </div>
    </Layout>
  );
}
