import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Download, Calendar, MapPin, QrCode, BookOpen } from 'lucide-react';
import api from '../services/api';

const Confirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [qrCode, setQrCode] = useState(location.state?.qrCode || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    const fetchData = async () => {
      if (!booking) {
        try {
          const res = await api.get(`/bookings/${bookingId}`);
          setBooking(res.data.data.booking);
        } catch {
          console.error('Failed to fetch booking');
        }
      }
      if (!qrCode) {
        try {
          const res = await api.get(`/qr/${bookingId}`);
          setQrCode(res.data.data.qrCode);
        } catch {
          console.error('Failed to fetch QR');
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-bg">
      <div className="max-w-2xl mx-auto px-6 py-10 text-center">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Room', 'Details', 'Payment', 'Confirm'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-accent text-primary-dark">{i + 1}</div>
              <span className="text-sm font-medium hidden sm:block text-text">{step}</span>
              {i < 3 && <div className="w-8 h-0.5 bg-accent"></div>}
            </div>
          ))}
        </div>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-center text-white mb-8 animate-slide-up shadow-xl">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 animate-float" />
          <h1 className="text-3xl font-bold mb-2">🎉 Booking Confirmed!</h1>
          <p className="text-green-100">Your reservation has been successfully processed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-bold text-text mb-5 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" /> Booking Details
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-text-secondary block text-xs uppercase tracking-wider mb-0.5">Booking ID</span>
                <span className="font-mono font-medium text-text">{booking?.id?.slice(0, 13)}...</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs uppercase tracking-wider mb-0.5">Room</span>
                <span className="font-medium text-text">{booking?.room?.room_type} — Room {booking?.room?.room_number}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-text-secondary block text-xs uppercase tracking-wider mb-0.5">Check-in</span>
                  <span className="font-medium text-text flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {booking?.check_in_date && new Date(booking.check_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block text-xs uppercase tracking-wider mb-0.5">Check-out</span>
                  <span className="font-medium text-text flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {booking?.check_out_date && new Date(booking.check_out_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-text-secondary block text-xs uppercase tracking-wider mb-0.5">Duration</span>
                <span className="font-medium text-text">{booking?.total_nights} night{booking?.total_nights > 1 ? 's' : ''}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs uppercase tracking-wider mb-0.5">Total Paid</span>
                <span className="text-2xl font-bold text-accent">₹{booking?.total_amount && parseFloat(booking.total_amount).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs uppercase tracking-wider mb-0.5">Status</span>
                <span className="inline-block px-3 py-1 badge-confirmed rounded-full text-xs font-bold">Confirmed ✓</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-bold text-text mb-2 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-accent" /> Your QR Code
            </h3>
            <p className="text-sm text-text-secondary mb-5">Show this at the lobby kiosk for contactless check-in</p>

            {qrCode ? (
              <>
                <div className="bg-bg rounded-xl p-6 inline-block mb-5">
                  <img src={qrCode} alt="Booking QR Code" className="w-48 h-48 mx-auto" />
                </div>
                <a href={qrCode} download={`hotelease-booking-${booking?.id?.slice(0, 8)}.png`}
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#1E3A5F] text-[#1E3A5F] font-semibold rounded-xl hover:bg-[#1E3A5F] hover:text-white transition text-sm">
                  <Download className="w-4 h-4" /> Download QR Code
                </a>
              </>
            ) : (
              <div className="bg-bg rounded-xl p-8">
                <QrCode className="w-16 h-16 text-text-secondary/30 mx-auto mb-3" />
                <p className="text-sm text-text-secondary">QR code will appear here once payment is fully processed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link to="/my-bookings" className="px-6 py-3 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#162d4a] transition text-sm text-center">
            View My Bookings
          </Link>
          <Link to="/rooms" className="px-6 py-3 border-2 border-[#1E3A5F] text-[#1E3A5F] rounded-xl font-semibold hover:bg-[#1E3A5F] hover:text-white transition text-sm text-center">
            Book Another Room
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-700">
          <p className="font-semibold mb-2">📋 Check-in Instructions:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>Check-in time: <strong>2:00 PM</strong></li>
            <li>Show your QR code at the lobby kiosk</li>
            <li>Carry a valid photo ID for verification</li>
            <li>For assistance, dial Extension 0 at the front desk</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
