import { useLocation, Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <Layout>
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-[#0A2A42] mb-4">
          Check your email 📧
        </h2>

        <p className="text-gray-700 mb-4">
          We sent a verification link
          {email && (
            <>
              {" "}
              to <strong>{email}</strong>
            </>
          )}
          .
        </p>

        <p className="text-gray-600 mb-6">
          Click the link in the email to verify your account before logging in.
        </p>

        <Link
          to="/login"
          className="text-[#0A2A42] font-medium underline"
        >
          Didn’t get the email? Resend verification
        </Link>
      </div>
    </Layout>
  );
}
