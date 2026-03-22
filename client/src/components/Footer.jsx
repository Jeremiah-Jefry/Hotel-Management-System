import { Hotel, Github, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-primary-dark text-white/80">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
              <Hotel className="w-5 h-5 text-primary-dark" />
            </div>
            <span className="text-xl font-bold text-white">Hotel<span className="text-accent">Ease</span></span>
          </div>
          <p className="text-sm text-white/60 max-w-sm leading-relaxed">
            Experience seamless hotel booking with contactless check-in, secure payments, and premium room choices. Book smart, stay comfortable.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5">
            <li><Link to="/" className="text-sm text-white/60 hover:text-accent transition-colors">Home</Link></li>
            <li><Link to="/rooms" className="text-sm text-white/60 hover:text-accent transition-colors">Browse Rooms</Link></li>
            <li><Link to="/login" className="text-sm text-white/60 hover:text-accent transition-colors">Login</Link></li>
            <li><Link to="/register" className="text-sm text-white/60 hover:text-accent transition-colors">Sign Up</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2 text-sm text-white/60">
              <MapPin className="w-4 h-4 text-accent" /> 123 Hotel Street, Mumbai
            </li>
            <li className="flex items-center gap-2 text-sm text-white/60">
              <Phone className="w-4 h-4 text-accent" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2 text-sm text-white/60">
              <Mail className="w-4 h-4 text-accent" /> info@hotelease.com
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-white/10 my-8" />
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
