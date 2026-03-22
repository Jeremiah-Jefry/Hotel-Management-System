import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, Hotel } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.phone);
      toast.success(`Welcome, ${user.name}! Account created.`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-text">Create Account</h1>
          <p className="text-sm text-text-secondary mt-1">Join HotelEase for seamless booking</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-border p-8 animate-slide-up">
          <div className="mb-4">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters"
                className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text">
                {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Creating Account...</span> : 'Create Account'}
          </button>

          <p className="text-sm text-text-secondary text-center mt-6">
            Already have an account? <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
