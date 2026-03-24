import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="w-full bg-[#1E3A5F] text-white mt-auto">
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-primary-dark font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-white">Hotel<span className="text-accent">Ease</span></span>
          </div>
          <p className="text-sm text-white/60 max-w-sm leading-relaxed">
            Experience seamless hotel booking with contactless check-in, secure payments, and premium room choices. Book smart, stay comfortable.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[#F59E0B] font-semibold text-sm uppercase tracking-wider mb-3">Quick Links</h4>
          <ul className="space-y-2.5">
            <li><Link to="/" className="text-white/70 text-sm hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/rooms" className="text-white/70 text-sm hover:text-white transition-colors">Browse Rooms</Link></li>
            <li><Link to="/login" className="text-white/70 text-sm hover:text-white transition-colors">Login</Link></li>
            <li><Link to="/register" className="text-white/70 text-sm hover:text-white transition-colors">Sign Up</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
            <h4 className="text-[#F59E0B] font-semibold text-sm uppercase tracking-wider mb-3">Contact</h4>
          <ul className="space-y-2.5">
            <li className="text-sm text-white/60">
              📍 123 Hotel Street, Mumbai
            </li>
            <li className="text-sm text-white/60">
              📞 +91 98765 43210
            </li>
            <li className="text-sm text-white/60">
              📧 info@hotelease.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20 mt-8 pt-4 text-center text-white/50 text-xs">
        <p className="text-xs text-white/40">
          © 2024 HotelEase. Team Code Alchemists — Project P-2024-28-FW-128.
        </p>
        <p className="text-xs text-white/40">
          Built with React, Node.js, and ❤️
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
