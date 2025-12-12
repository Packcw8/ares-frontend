import { Link, useLocation } from "react-router-dom";

export default function AuthCTA({ action = "participate" }) {
  const location = useLocation();

  return (
    <div className="border rounded p-4 text-center bg-gray-50">
      <p className="text-sm mb-2">
        Create a free account to {action}.
      </p>
      <Link
        to={`/signup?returnTo=${location.pathname}`}
        className="btn-primary"
      >
        Create account
      </Link>
    </div>
  );
}
