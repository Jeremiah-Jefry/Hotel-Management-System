import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Booking = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { checkIn, checkOut, nights, totalAmount, room } = location.state || {};
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  if (!room || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen pt-20 bg-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">No booking information found.</p>
          <button onClick={() => navigate('/rooms')} className="px-6 py-2 bg-primary text-white rounded-lg">Browse Rooms</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create booking
      const bookingRes = await api.post('/bookings', {
        room_id: parseInt(roomId),
        check_in_date: checkIn,
        check_out_date: checkOut,
        guest_phone: phone
      });

      const booking = bookingRes.data.data.booking;

      // Create payment order
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking.id,
        amount: totalAmount
      });

      toast.success('Booking created! Proceeding to payment...');

      navigate('/payment', {
        state: {
          booking,
          order: orderRes.data.data,
          room
        }
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      toast.error(msg);
      if (err.response?.status === 409) {
        toast.error('Room is not available for selected dates. Please try different dates.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Room', 'Details', 'Payment', 'Confirm'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i <= 1 ? 'bg-accent text-primary-dark' : 'bg-gray-200 text-gray-500'
              }`}>{i + 1}</div>
              <span className={`text-sm font-medium hidden sm:block ${i <= 1 ? 'text-text' : 'text-text-secondary'}`}>{step}</span>
              {i < 3 && <div className={`w-8 h-0.5 ${i < 1 ? 'bg-accent' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
              <h2 className="text-xl font-bold text-text mb-6">Guest Information</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-gray-700 text-left mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input type="text" value={user?.name || ''} readOnly
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-bg cursor-not-allowed focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-gray-700 text-left mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input type="email" value={user?.email || ''} readOnly
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-bg cursor-not-allowed focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full mb-4">
                  <label className="text-sm font-medium text-gray-700 text-left mb-1.5 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
                  </div>
                </div>

                {/* Stay Dates */}
                <div className="bg-bg rounded-xl p-5 mb-6">
                  <h4 className="text-sm font-semibold text-text mb-3">Stay Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs text-text-secondary">Check-in</p>
                        <p className="text-sm font-medium text-text">{new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs text-text-secondary">Check-out</p>
                        <p className="text-sm font-medium text-text">{new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full lg:w-auto px-6 py-2 bg-accent hover:bg-accent-dark text-primary-dark font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-primary-dark border-t-transparent rounded-full animate-spin"></span> Processing...</>
                  ) : (
                    <>Proceed to Payment <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden sticky top-24">
              <div className="h-40 overflow-hidden">
                <img src={room.image_url} alt={room.room_type} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-text mb-1">{room.room_type} Room</h3>
                <p className="text-sm text-text-secondary mb-4">Room {room.room_number}</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Rate per night</span>
                    <span className="font-medium">₹{parseFloat(room.price_per_night).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Duration</span>
                    <span className="font-medium">{nights} night{nights > 1 ? 's' : ''}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-text">Total Amount</span>
                    <span className="font-bold text-accent text-xl">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
