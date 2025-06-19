import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import { getToken, parseJwt } from "../../utils/auth";

const API = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    const decoded = parseJwt(token);

    if (!token || decoded?.role !== "admin") {
      navigate("/login");
    } else {
      fetchUsers();
    }
  }, [navigate]); // ✅ ESLint-safe

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const verifyUser = async (id) => {
    await axios.patch(`${API}/admin/verify-user/${id}`, null, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    await axios.delete(`${API}/admin/delete-user/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchUsers();
  };

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-[#3a2f1b] mb-6 uppercase tracking-wider">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <div key={user.id} className="card">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {user.role === "official" && user.is_verified ? (
                <span className="text-green-700 font-semibold">Verified</span>
              ) : (
                <span className="text-red-600 font-semibold">Not Verified</span>
              )}
            </p>

            <div className="flex gap-3 mt-4">
              {user.role === "official" && !user.is_verified && (
                <button onClick={() => verifyUser(user.id)}>✅ Verify</button>
              )}
              {user.role !== "admin" && (
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-700 hover:bg-red-800"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
