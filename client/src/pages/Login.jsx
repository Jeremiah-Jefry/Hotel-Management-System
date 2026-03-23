import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Hotel } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#162d4a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-slide-up">
          <div className="flex justify-center mb-6">
            <div className="bg-[#F59E0B] w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
              <Hotel className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1E3A5F] text-center mb-1">Welcome Back</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Sign in to your HotelEase account</p>
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition" />
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors">
                {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#1E3A5F] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#162d4a] transition mt-2 disabled:opacity-50">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Signing in...</span> : 'Sign In'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mt-4 text-center">
              Don't have an account? <Link to="/register" className="text-accent font-semibold hover:underline">Sign up</Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-700 font-medium mb-2">Demo Credentials:</p>
            <button type="button" onClick={() => { setEmail('admin@hotelease.com'); setPassword('Admin@123'); }}
              className="text-xs text-amber-700 hover:underline block mb-1">Admin: admin@hotelease.com</button>
            <button type="button" onClick={() => { setEmail('guest1@gmail.com'); setPassword('Guest@123'); }}
              className="text-xs text-amber-700 hover:underline block">Guest: guest1@gmail.com</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
