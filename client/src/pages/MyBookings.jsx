import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, QrCode, X, Eye } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data.bookings);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const viewQR = async (bookingId) => {
    try {
      const res = await api.get(`/qr/${bookingId}`);
      setQrModal(res.data.data);
    } catch {
      toast.error('QR code not available');
    }
  };

  const statusColors = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    checked_in: 'badge-checked_in',
    checked_out: 'badge-checked_out',
    cancelled: 'badge-cancelled'
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-bg">
      <div className="gradient-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-white/60">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No bookings yet</h3>
            <p className="text-text-secondary mb-6">Start exploring our rooms and make your first booking!</p>
            <Link to="/rooms" className="px-6 py-3 bg-accent hover:bg-accent-dark text-primary-dark font-bold rounded-lg transition-all shadow-lg">
              Browse Rooms
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, idx) => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden card-hover animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-40 sm:h-auto overflow-hidden shrink-0">
                    <img src={b.room?.image_url} alt={b.room?.room_type} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-text">{b.room?.room_type} Room — {b.room?.room_number}</h3>
                        <p className="text-xs text-text-secondary font-mono">ID: {b.id.slice(0, 13)}...</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColors[b.status]}`}>
                        {b.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-text-secondary text-xs block">Check-in</span>
                        <span className="font-medium">{new Date(b.check_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary text-xs block">Check-out</span>
                        <span className="font-medium">{new Date(b.check_out_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary text-xs block">Nights</span>
                        <span className="font-medium">{b.total_nights}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary text-xs block">Total</span>
                        <span className="font-bold text-accent">₹{parseFloat(b.total_amount).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {b.status === 'confirmed' && (
                        <button onClick={() => viewQR(b.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors">
                          <QrCode className="w-3.5 h-3.5" /> View QR
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <Link to={`/confirmation/${b.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-dark text-xs font-semibold rounded-lg hover:bg-accent/20 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </Link>
                      )}
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button onClick={() => handleCancel(b.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-error text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text">QR Code</h3>
              <button onClick={() => setQrModal(null)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center">
              <div className="bg-bg rounded-xl p-6 mb-4">
                <img src={qrModal.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
              </div>
              <p className="text-sm text-text-secondary mb-4">Room {qrModal.booking?.room_number} • {qrModal.booking?.guest_name}</p>
              <a href={qrModal.qrCode} download="hotelease-qr.png"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white font-semibold rounded-lg text-sm">
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
