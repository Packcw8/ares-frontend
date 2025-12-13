import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Signup() {
  const [form, setForm] = useState({
    role: "citizen",

    username: "",
    email: "",
    password: "",

    full_name: "",
    title: "",
    agency: "",
    official_email: "",
    state: "",
    jurisdiction: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isOfficial = form.role === "official";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedRules) {
      alert("You must agree to the ARES Community Rules to continue.");
      return;
    }

    setLoading(true);

    try {
      const payload =
        isOfficial
          ? form
          : {
              role: form.role,
              username: form.username,
              email: form.email,
              password: form.password,
            };

      await api.post("/auth/signup", payload);
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
        {isOfficial ? "Apply as an Official" : "Sign Up"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="citizen">🗳️ Citizen</option>
          <option value="official">🏛️ Official</option>
        </select>

        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />

        {/* Password with toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-lg pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {isOfficial && (
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm text-gray-600">
              Official accounts require manual verification before posting.
            </p>

            <input
              type="text"
              placeholder="Full Legal Name"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="text"
              placeholder="Title / Role"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="text"
              placeholder="Agency / Department"
              value={form.agency}
              onChange={(e) => setForm({ ...form, agency: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="email"
              placeholder="Official Work Email"
              value={form.official_email}
              onChange={(e) =>
                setForm({ ...form, official_email: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="text"
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="text"
              placeholder="Jurisdiction"
              value={form.jurisdiction}
              onChange={(e) =>
                setForm({ ...form, jurisdiction: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        )}

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
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0A2A42] text-white py-2 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading
            ? "Submitting…"
            : isOfficial
            ? "Apply as Official"
            : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="underline text-[#0A2A42]">
            Log in
          </Link>
        </p>
      </form>
    </Layout>
  );
}
