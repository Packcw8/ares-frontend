import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', form);
      alert('Signup successful!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4">Create Your Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
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
        <button
          type="submit"
          className="w-full bg-[#0A2A42] text-white py-2 rounded-lg font-semibold"
        >
          Sign Up
        </button>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0A2A42] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </Layout>
  );
}
