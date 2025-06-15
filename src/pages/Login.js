import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';
import Layout from '../components/Layout';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.access_token);
      setAuthToken(res.data.access_token);
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4">Login to Your Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <button
          type="submit"
          className="w-full bg-[#0A2A42] text-white py-2 rounded-lg font-semibold"
        >
          Login
        </button>
        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-[#0A2A42] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </Layout>
  );
}
