import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';
import Layout from '../components/Layout';
import { parseJwt } from '../utils/auth';

export default function Login() {
  const [form, setForm] = useState({
    identifier: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendSent(false);

    try {
      const res = await api.post('/auth/login', form);
      const token = res.data.access_token;

      localStorage.setItem('token', token);
      setAuthToken(token);

      const decoded = parseJwt(token);

      if (decoded?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/vault/public');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      await api.post('/auth/resend-verification', {
        email: form.identifier,
      });

      setResendSent(true);
    } catch {
      // Still show success to avoid account enumeration
      setResendSent(true);
    } finally {
      setResending(false);
    }
  };

  const showResend =
    error.toLowerCase().includes('verify your email');

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4">Login to Your Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Email or Username"
          value={form.identifier}
          onChange={(e) =>
            setForm({ ...form, identifier: e.target.value })
          }
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />

        <button
          type="submit"
          className="w-full bg-[#0A2A42] text-white py-2 rounded-lg font-semibold"
        >
          Login
        </button>

        {error && (
          <div className="text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {showResend && !resendSent && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full text-sm text-[#0A2A42] underline"
          >
            {resending
              ? 'Sending verification email…'
              : 'Resend verification email'}
          </button>
        )}

        {resendSent && (
          <div className="text-sm text-green-600 text-center">
            If the email exists, a verification link has been sent.
          </div>
        )}

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{' '}
          <Link
            to="/signup"
            className="text-[#0A2A42] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </Layout>
  );
}
