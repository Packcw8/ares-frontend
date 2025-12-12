import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      setStatus("error");
      setMessage("Invalid verification link (missing email or token).");
      return;
    }

    api
      .post("/auth/verify-email", { email, token })
      .then(() => {
        setStatus("success");
        setMessage("✅ Email verified! You can now log in.");

        // Optional: redirect to login after a short pause
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.detail ||
            "Verification failed or the link has expired."
        );
      });
  }, [searchParams, navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-extrabold text-[#0A2A42] mb-6 uppercase tracking-wider">
          Email Verification
        </h2>

        {status === "loading" && (
          <p className="text-gray-700">Verifying your email…</p>
        )}

        {status === "success" && (
          <>
            <p className="text-green-700 font-semibold">{message}</p>
            <p className="text-gray-600 mt-3">Redirecting to login…</p>
            <Link
              to="/login"
              className="inline-block mt-4 text-[#0A2A42] font-medium underline"
            >
              Go to login now
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-red-700 font-semibold mb-4">{message}</p>

            <Link
              to="/resend-verification"
              className="inline-block text-[#0A2A42] font-medium underline"
            >
              Resend verification email
            </Link>

            <div className="mt-4">
              <Link to="/login" className="text-gray-600 hover:underline">
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
