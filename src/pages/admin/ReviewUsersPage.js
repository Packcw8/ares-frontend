import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function ReviewUsersPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/users")
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const daysAgo = days =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const filteredUsers = users.filter(user => {
    if (filter === "new") {
      return new Date(user.created_at) >= daysAgo(7);
    }
    if (filter === "unverified-email") {
      return !user.is_email_verified;
    }
    if (filter === "official-pending") {
      return user.role === "official_pending";
    }
    if (filter === "admins") {
      return user.role === "admin";
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">👤 Review Users</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {[
            ["all", "All Users"],
            ["new", "New (7 days)"],
            ["unverified-email", "Unverified Email"],
            ["official-pending", "Pending Officials"],
            ["admins", "Admins"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded border text-sm ${
                filter === key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* User Cards */}
        {loading && <p>Loading users…</p>}

        {!loading && filteredUsers.length === 0 && (
          <p className="text-gray-500">No users match this filter.</p>
        )}

        <div className="grid gap-4">
          {filteredUsers.map(user => {
            const created = new Date(user.created_at);
            const isNew = created >= daysAgo(7);

            return (
              <div
                key={user.id}
                className={`border rounded p-4 shadow-sm bg-white space-y-2 ${
                  isNew ? "border-blue-500" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {user.username}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {user.email}
                    </p>
                  </div>

                  {isNew && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      NEW
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-2 py-1 rounded bg-gray-100">
                    Role: {user.role.replace("_", " ")}
                  </span>

                  <span
                    className={`px-2 py-1 rounded ${
                      user.is_email_verified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Email: {user.is_email_verified ? "Verified" : "Unverified"}
                  </span>

                  <span
                    className={`px-2 py-1 rounded ${
                      user.is_verified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    Official: {user.is_verified ? "Verified" : "Not Verified"}
                  </span>

                  {user.is_anonymous && (
                    <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">
                      Anonymous
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Joined: {created.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
