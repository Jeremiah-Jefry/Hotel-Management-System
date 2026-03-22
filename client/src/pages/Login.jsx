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
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Hotel className="w-7 h-7 text-primary-dark" />
          </div>
          <h1 className="text-2xl font-bold text-text">Welcome Back</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to your HotelEase account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-border p-8 animate-slide-up">
          <div className="mb-5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors">
                {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Signing in...</span> : 'Sign In'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account? <Link to="/register" className="text-accent font-semibold hover:underline">Sign up</Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-bg rounded-xl">
            <p className="text-xs font-semibold text-text-secondary mb-2">Demo Credentials:</p>
            <button type="button" onClick={() => { setEmail('admin@hotelease.com'); setPassword('Admin@123'); }}
              className="text-xs text-accent hover:underline block mb-1">Admin: admin@hotelease.com</button>
            <button type="button" onClick={() => { setEmail('guest1@gmail.com'); setPassword('Guest@123'); }}
              className="text-xs text-accent hover:underline block">Guest: guest1@gmail.com</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
