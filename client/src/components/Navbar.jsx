import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Hotel, User, LogOut, LayoutDashboard, BookOpen } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-[#1E3A5F] shadow-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between w-full h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Hotel className="w-5 h-5 text-primary-dark" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">
              Hotel<span className="text-[#F59E0B]">Ease</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white text-sm font-medium hover:text-[#F59E0B] transition-colors">
              Home
            </Link>
            <Link to="/rooms" className="text-white text-sm font-medium hover:text-[#F59E0B] transition-colors">
              Rooms
            </Link>
            {isAuthenticated && (
              <Link to="/my-bookings" className="text-white text-sm font-medium hover:text-[#F59E0B] transition-colors">
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-[#F59E0B] text-sm font-medium hover:text-yellow-300 transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-primary-dark">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-border py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-text">{user?.name}</p>
                      <p className="text-xs text-text-secondary">{user?.email}</p>
                    </div>
                    <Link to="/my-bookings" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-bg transition-colors">
                      <BookOpen className="w-4 h-4" /> My Bookings
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-bg transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-border" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="border border-white text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:text-[#1E3A5F] transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden ml-auto p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#1E3A5F] border-t border-white/20 shadow-lg animate-slide-down">
          <div className="w-full flex flex-col gap-4 px-4 py-4">
            <Link to="/" onClick={() => setIsOpen(false)}
              className="text-white text-sm font-medium hover:text-[#F59E0B] transition-colors">
              Home
            </Link>
            <Link to="/rooms" onClick={() => setIsOpen(false)}
              className="text-white text-sm font-medium hover:text-[#F59E0B] transition-colors">
              Rooms
            </Link>
            {isAuthenticated && (
              <Link to="/my-bookings" onClick={() => setIsOpen(false)}
                className="text-white text-sm font-medium hover:text-[#F59E0B] transition-colors">
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-accent hover:bg-white/10 rounded-lg transition-all">
                Admin Dashboard
              </Link>
            )}
            <hr className="border-white/10 my-2" />
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-white/60 text-sm">{user?.name} ({user?.email})</div>
                <button onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 rounded-lg transition-all">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setIsOpen(false)}
                  className="flex-1 text-center border border-white text-white px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-[#1E3A5F] transition-colors">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}
                  className="flex-1 text-center bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
