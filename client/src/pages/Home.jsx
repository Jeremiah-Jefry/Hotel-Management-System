import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, QrCode, Zap, Star, ArrowRight, Calendar, Users } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        // Get one of each type for featured
        const rooms = res.data.data.rooms;
        const featured = [];
        const types = ['Standard', 'Deluxe', 'Suite'];
        types.forEach(type => {
          const room = rooms.find(r => r.room_type === type);
          if (room) featured.push(room);
        });
        setFeaturedRooms(featured);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRooms();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 1) params.set('guests', guests);
    navigate(`/rooms?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero min-h-[90vh] flex items-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Star className="w-4 h-4" /> Premium Hotel Experience
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 animate-slide-up">
              Book Smart.<br />
              <span className="text-accent">Stay Comfortable.</span>
            </h1>
            <p className="text-lg text-white/60 max-w-xl mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Discover luxury rooms, make secure payments via Razorpay, and enjoy contactless QR check-in. Your perfect hotel experience starts here.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="glass rounded-2xl p-4 sm:p-6 shadow-2xl animate-slide-up max-w-2xl" style={{ animationDelay: '0.3s' }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={today}
                      className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || today}
                      className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <select value={guests} onChange={e => setGuests(parseInt(e.target.value))}
                      className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none appearance-none bg-white transition-all">
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit"
                className="w-full py-3 bg-accent hover:bg-accent-dark text-primary-dark font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm">
                <Search className="w-4 h-4" /> Search Available Rooms
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text mb-3">Our Premium Rooms</h2>
          <p className="text-text-secondary max-w-xl mx-auto">Choose from our carefully curated selection of rooms designed for your ultimate comfort.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredRooms.map((room, idx) => (
            <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="relative h-56 overflow-hidden">
                <img src={room.image_url} alt={room.room_type} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-full text-primary shadow">
                    {room.room_type}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1.5 bg-accent text-primary-dark text-sm font-bold rounded-lg shadow-lg">
                    ₹{parseFloat(room.price_per_night).toLocaleString()}<span className="text-xs font-normal">/night</span>
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-text mb-2">{room.room_type} Room {room.room_number}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-4">{room.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(room.amenities || []).slice(0, 4).map((a, i) => (
                    <span key={i} className="px-2 py-1 bg-bg text-xs text-text-secondary rounded-md">{a}</span>
                  ))}
                </div>
                <Link to={`/rooms/${room.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all text-sm">
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/rooms" className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl">
            View All Rooms <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Why HotelEase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-3">Why Choose HotelEase?</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Modern hotel booking reimagined with cutting-edge technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Fast Booking', desc: 'Complete your entire booking in under 2 minutes. Quick, simple, effortless.', color: 'bg-blue-50 text-blue-600' },
              { icon: Shield, title: 'Secure Payment', desc: 'Razorpay-powered payments with HMAC SHA256 signature verification.', color: 'bg-green-50 text-green-600' },
              { icon: QrCode, title: 'Contactless Check-in', desc: 'Get a QR code instantly after payment. Scan and check in — no queues.', color: 'bg-amber-50 text-amber-600' }
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-bg card-hover animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for Your Next Stay?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Browse our rooms, pick your dates, and book in minutes. Your comfort awaits.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rooms" className="px-8 py-3 bg-accent hover:bg-accent-dark text-primary-dark font-bold rounded-lg transition-all shadow-lg hover:shadow-xl">
              Browse Rooms
            </Link>
            <Link to="/register" className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
