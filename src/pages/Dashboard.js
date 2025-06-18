import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <div className="text-center text-white space-y-10 mt-10">

        {/* Welcome Message */}
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wide text-[#f4e1b9] drop-shadow-md">
            Welcome, Citizen
          </h1>
          <p className="mt-2 text-md italic text-gray-300">
            “Accountability begins with you. Here’s the state of your republic.”
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-6 max-w-lg mx-auto">
          <Link
            to="/ratings/new"
            className="block px-6 py-4 rounded-xl border border-yellow-600 bg-[#1e1e1e] hover:bg-yellow-700 hover:text-white transition-all shadow-md"
          >
            🖋️ <span className="font-semibold">Submit a Rating</span>
            <div className="text-xs text-gray-400 mt-1">Petition for redress of grievances</div>
          </Link>

          <Link
            to="/ratings"
            className="block px-6 py-4 rounded-xl border border-blue-600 bg-[#1e1e1e] hover:bg-blue-700 hover:text-white transition-all shadow-md"
          >
            🔍 <span className="font-semibold">Search My State & County</span>
            <div className="text-xs text-gray-400 mt-1">Investigate your public servants</div>
          </Link>

          <Link
            to="/ratings"
            className="block px-6 py-4 rounded-xl border border-green-600 bg-[#1e1e1e] hover:bg-green-700 hover:text-white transition-all shadow-md"
          >
            🗺️ <span className="font-semibold">Explore the Union</span>
            <div className="text-xs text-gray-400 mt-1">Browse all officials by reputation</div>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-xs text-gray-500 italic">
          United we stand. Informed we hold power.
        </div>
      </div>
    </Layout>
  );
}
