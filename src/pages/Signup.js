import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "citizen",
  });

  const [acceptedRules, setAcceptedRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedRules) {
      alert("You must agree to the ARES Community Rules to continue.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/signup", form);

      // Redirect to check-email screen instead of login
      navigate("/check-email", { state: { email: form.email } });
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-extrabold text-[#0A2A42] mb-6 uppercase tracking-wider">
        Sign Up
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
        >
          <option value="citizen">🗳️ Citizen</option>
          <option value="official">🏛️ Official</option>
        </select>

        {/* Community Rules Agreement */}
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={acceptedRules}
            onChange={(e) => setAcceptedRules(e.target.checked)}
            required
            className="mt-1"
          />
          <span>
            I agree to the{" "}
            <Link
              to="/rules"
              target="_blank"
              className="text-[#0A2A42] font-medium underline"
            >
              ARES Community Rules
            </Link>
            <span className="block text-xs text-gray-500 mt-1">
              (No threats, doxing, harassment, or incitement)
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0A2A42] text-white py-2 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#0A2A42] font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </Layout>
  );
}
