import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Dashboard() {
  return (
    <Layout>

      {/* Welcome Section (Not Wrapped in Card) */}
      <div className="text-center mt-6 mb-10">
        <h1 className="text-4xl font-extrabold uppercase tracking-wide text-[#283d63]">
          Welcome, Citizen
        </h1>
        <p className="mt-2 text-md italic text-[#5a4635]">
          “Accountability begins with you. Here’s the state of your republic.”
        </p>
      </div>

      {/* Three Primary Cards */}
      <div className="max-w-xl mx-auto space-y-4">

        <Link
          to="/ratings/new"
          className="block border border-[#283d63] bg-[#f5ecd9] rounded-xl px-6 py-4 shadow hover:bg-[#ede3cb] transition"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🖋️</span>
            <div>
              <h2 className="text-lg font-bold text-[#3a2f1b]">Submit a Rating</h2>
              <p className="text-sm text-[#5a4635]">Petition for redress of grievances</p>
            </div>
          </div>
        </Link>

        <Link
          to="/ratings"
          className="block border border-[#283d63] bg-[#f5ecd9] rounded-xl px-6 py-4 shadow hover:bg-[#ede3cb] transition"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h2 className="text-lg font-bold text-[#3a2f1b]">Search District</h2>
              <p className="text-sm text-[#5a4635]">Investigate your public servants</p>
            </div>
          </div>
        </Link>

        <Link
          to="/ratings"
          className="block border border-[#283d63] bg-[#f5ecd9] rounded-xl px-6 py-4 shadow hover:bg-[#ede3cb] transition"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <h2 className="text-lg font-bold text-[#3a2f1b]">Explore the Union</h2>
              <p className="text-sm text-[#5a4635]">Browse reputation by region</p>
            </div>
          </div>
        </Link>
      </div>
    </Layout>
  );
}
