import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api"; // Axios instance

export default function Dashboard() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    api.get("/ratings/user/impact")
      .then(res => setImpact(res.data))
      .catch(() => console.warn("Failed to load user impact"));
  }, []);

  return (
    <Layout>
      <div className="card max-w-2xl mx-auto space-y-10 mt-4">

        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold uppercase tracking-wide text-[#8b1e3f] drop-shadow-sm border-b border-[#c2a76d] pb-2">
            🦅 Welcome, Citizen
          </h1>
          <p className="mt-2 text-sm italic text-[#5a4635]">
            “Accountability begins with you. Here’s the state of your republic.”
          </p>
        </div>

        {/* Action Links */}
        <div className="space-y-4">
          <Link
            to="/ratings/new"
            className="block px-6 py-4 rounded-xl border border-yellow-600 bg-[#1e1e1e] text-white hover:bg-yellow-700 transition-all shadow-md"
          >
            🖋️ <span className="font-semibold">Submit a Rating</span>
            <div className="text-xs text-gray-300 mt-1">Petition for redress of grievances</div>
          </Link>

          <Link
            to="/ratings"
            className="block px-6 py-4 rounded-xl border border-blue-600 bg-[#1e1e1e] text-white hover:bg-blue-700 transition-all shadow-md"
          >
            🔍 <span className="font-semibold">Search My State & County</span>
            <div className="text-xs text-gray-300 mt-1">Investigate your public servants</div>
          </Link>

          <Link
            to="/ratings"
            className="block px-6 py-4 rounded-xl border border-green-600 bg-[#1e1e1e] text-white hover:bg-green-700 transition-all shadow-md"
          >
            🗺️ <span className="font-semibold">Explore the Union</span>
            <div className="text-xs text-gray-300 mt-1">Browse all officials by reputation</div>
          </Link>
        </div>

        {/* User Civic Impact */}
        {impact && (
          <div className="mt-6 p-4 border-t border-[#c2a76d] text-sm text-[#3a2f1b] space-y-2">
            <h2 className="font-bold text-md">📊 Your Civic Impact</h2>
            <ul className="list-disc list-inside space-y-1 text-[#5a4635]">
              <li>Reports Submitted: <strong>{impact.total_submitted}</strong></li>
              <li>Verified Reports: <strong>{impact.verified_count}</strong></li>
              {impact.top_comment && (
                <li>Top Comment: <em>“{impact.top_comment}”</em></li>
              )}
            </ul>
          </div>
        )}

        {/* Closing */}
        <div className="text-center mt-6 text-xs italic text-[#5a4635]">
          United we stand. Informed we hold power.
        </div>
      </div>
    </Layout>
  );
}
