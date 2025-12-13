import { useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", {
        identifier,
      });
      setSent(true);
    } catch {
      // Enumeration-safe: always show success
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-extrabold text-[#0A2A42] mb-4">
          Reset your password
        </h2>

        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
            <p className="font-medium mb-2">
              If an account exists, a reset link has been sent.
            </p>
            <p className="text-sm">
              Check your email and follow the instructions.
            </p>
            <p className="text-sm mt-3">
              <Link to="/login" className="underline text-[#0A2A42]">
                Back to login
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter your email address or username. If an account exists, we’ll
              send a password reset link.
            </p>

            <input
              type="text"
              placeholder="Email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2A42] text-white py-2 rounded-lg font-semibold disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-sm text-center text-gray-600">
              Remembered your password?{" "}
              <Link to="/login" className="underline text-[#0A2A42]">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </Layout>
  );
}
