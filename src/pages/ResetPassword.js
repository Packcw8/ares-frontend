import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: password,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Reset link is invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Invalid reset link
          </h2>
          <p className="text-sm text-gray-600">
            This reset link is missing or malformed.
          </p>
          <Link
            to="/forgot-password"
            className="underline text-[#0A2A42]"
          >
            Request a new reset link
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-extrabold text-[#0A2A42] mb-4">
          Choose a new password
        </h2>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
            <p className="font-medium">
              Password reset successful.
            </p>
            <p className="text-sm mt-2">
              Redirecting to login…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2A42] text-white py-2 rounded-lg font-semibold disabled:opacity-60"
            >
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
