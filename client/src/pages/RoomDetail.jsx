import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Users, Wifi, Wind, Tv, Coffee, Star, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const RoomDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data.data.room);
      } catch {
        toast.error('Room not found');
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const totalAmount = nights * (room ? parseFloat(room.price_per_night) : 0);
  const today = new Date().toISOString().split('T')[0];

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast('Please login to book a room', { icon: '🔒' });
      navigate('/login', { state: { from: `/rooms/${id}` } });
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    navigate(`/booking/${id}`, { state: { checkIn, checkOut, nights, totalAmount, room } });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!room) return null;

  const amenityIcons = { 'WiFi': Wifi, 'AC': Wind, 'TV': Tv, 'Tea/Coffee Maker': Coffee };

  return (
    <div className="min-h-screen pt-20 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button onClick={() => navigate('/rooms')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Room Details */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border">
              <div className="relative h-72 sm:h-96">
                <img src={room.image_url} alt={room.room_type} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-sm font-bold rounded-full text-primary shadow">
                    {room.room_type}
                  </span>
                  <span className="px-3 py-1.5 bg-accent text-primary-dark text-sm font-bold rounded-full shadow">
                    Room {room.room_number}
                  </span>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-text">{room.room_type} Room</h1>
                    <p className="text-text-secondary text-sm mt-1">Room {room.room_number} • Up to {room.max_occupancy} guests</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-accent">₹{parseFloat(room.price_per_night).toLocaleString()}</span>
                    <span className="text-sm text-text-secondary block">/night</span>
                  </div>
                </div>

                <p className="text-text-secondary leading-relaxed mb-6">{room.description}</p>

                {/* Amenities */}
                <h3 className="text-lg font-semibold text-text mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {(room.amenities || []).map((amenity, i) => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-bg rounded-lg">
                        <Icon className="w-4 h-4 text-accent" />
                        <span className="text-sm text-text">{amenity}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Policies */}
                <div className="bg-bg rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-text mb-3">Hotel Policies</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
                    <div>✅ Check-in: 2:00 PM</div>
                    <div>✅ Check-out: 11:00 AM</div>
                    <div>✅ Free cancellation (24hrs)</div>
                    <div>✅ QR contactless check-in</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Booking Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sticky top-24">
              <h3 className="text-lg font-bold text-text mb-1">Book This Room</h3>
              <p className="text-sm text-text-secondary mb-6">Select your dates to check availability</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Check-in Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={today}
                      className="w-full pl-10 pr-3 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Check-out Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || today}
                      className="w-full pl-10 pr-3 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none" />
                  </div>
                </div>
              </div>

              {/* Price Calculation */}
              {nights > 0 && (
                <div className="bg-bg rounded-xl p-4 mb-6 animate-fade-in">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">₹{parseFloat(room.price_per_night).toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span className="font-medium text-text">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">Taxes & fees</span>
                    <span className="text-success font-medium">Included</span>
                  </div>
                  <hr className="my-3 border-border" />
                  <div className="flex justify-between">
                    <span className="font-bold text-text">Total</span>
                    <span className="text-xl font-bold text-accent">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBookNow}
                disabled={!nights}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  nights > 0
                    ? 'bg-accent hover:bg-accent-dark text-primary-dark shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}>
                {nights > 0 ? `Book Now — ₹${totalAmount.toLocaleString()}` : 'Select dates to book'}
              </button>

              <p className="text-xs text-text-secondary text-center mt-3">Free cancellation up to 24 hours before check-in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
