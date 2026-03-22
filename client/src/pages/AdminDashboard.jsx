import { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import { BarChart3, BedDouble, Users, DollarSign, Calendar, QrCode, X, LogIn, LogOut as LogOutIcon, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// Dashboard Stats Page
const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data.stats);
      setRecentBookings(res.data.data.recentBookings);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/admin/bookings/${id}/${action}`);
      toast.success(`Booking ${action === 'checkin' ? 'checked in' : action === 'checkout' ? 'checked out' : 'cancelled'} successfully`);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
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
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Calendar, label: 'Total Bookings', value: stats?.totalBookings || 0, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
          { icon: DollarSign, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'bg-green-50 text-green-600', border: 'border-green-200' },
          { icon: BedDouble, label: 'Rooms Occupied', value: `${stats?.roomsOccupied || 0} / ${stats?.totalRooms || 10}`, color: 'bg-amber-50 text-amber-600', border: 'border-amber-200' },
          { icon: Users, label: 'Active Guests', value: stats?.activeGuests || 0, color: 'bg-purple-50 text-purple-600', border: 'border-purple-200' }
        ].map(({ icon: Icon, label, value, color, border }, i) => (
          <div key={i} className={`bg-white rounded-2xl shadow-sm border ${border} p-6 card-hover animate-slide-up`} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">{label}</p>
                <p className="text-2xl font-bold text-text">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-text">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-sm text-accent font-semibold hover:underline">View All →</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Booking ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Guest</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Room</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Check-in</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Check-out</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentBookings.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-10 text-center text-text-secondary">No bookings yet</td></tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{b.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text">{b.user?.name}</p>
                        <p className="text-xs text-text-secondary">{b.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{b.room?.room_type} {b.room?.room_number}</span>
                    </td>
                    <td className="px-6 py-4">{new Date(b.check_in_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-6 py-4">{new Date(b.check_out_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-6 py-4 font-semibold text-accent">₹{parseFloat(b.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColors[b.status]}`}>
                        {b.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        {b.qr_code_data && (
                          <button onClick={() => viewQR(b.id)} title="View QR"
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleAction(b.id, 'checkin')} title="Mark Check-in"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <LogIn className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {b.status === 'checked_in' && (
                          <button onClick={() => handleAction(b.id, 'checkout')} title="Mark Check-out"
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                            <LogOutIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!['checked_out', 'cancelled'].includes(b.status) && (
                          <button onClick={() => handleAction(b.id, 'cancel')} title="Cancel"
                            className="p-1.5 rounded-lg bg-red-50 text-error hover:bg-red-100 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">QR Code</h3>
              <button onClick={() => setQrModal(null)} className="p-1 hover:bg-bg rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center">
              <div className="bg-bg rounded-xl p-6 mb-4">
                <img src={qrModal.qrCode} alt="QR" className="w-48 h-48 mx-auto" />
              </div>
              <p className="text-sm text-text-secondary">Room {qrModal.booking?.room_number} • {qrModal.booking?.guest_name}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// All Bookings Page
const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/bookings/all', { params });
      setBookings(res.data.data.bookings);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(1); }, [statusFilter]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/admin/bookings/${id}/${action}`);
      toast.success('Action completed');
      fetchBookings(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const statusColors = {
    pending: 'badge-pending', confirmed: 'badge-confirmed', checked_in: 'badge-checked_in',
    checked_out: 'badge-checked_out', cancelled: 'badge-cancelled'
  };

  const filteredBookings = search
    ? bookings.filter(b =>
        b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-text">All Bookings ({pagination.total})</h2>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search guest or ID..."
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none w-56" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Guest</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Room</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Dates</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="7" className="px-5 py-4"><div className="h-6 skeleton rounded"></div></td></tr>
                ))
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-10 text-center text-text-secondary">No bookings found</td></tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{b.id.slice(0, 8)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{b.user?.name}</p>
                      <p className="text-xs text-text-secondary">{b.user?.email}</p>
                    </td>
                    <td className="px-5 py-3 font-medium">{b.room?.room_type} {b.room?.room_number}</td>
                    <td className="px-5 py-3 text-xs">
                      {new Date(b.check_in_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} →{' '}
                      {new Date(b.check_out_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-5 py-3 font-semibold text-accent">₹{parseFloat(b.total_amount).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusColors[b.status]}`}>
                        {b.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleAction(b.id, 'checkin')} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Check In</button>
                        )}
                        {b.status === 'checked_in' && (
                          <button onClick={() => handleAction(b.id, 'checkout')} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100">Check Out</button>
                        )}
                        {!['checked_out', 'cancelled'].includes(b.status) && (
                          <button onClick={() => handleAction(b.id, 'cancel')} className="px-2 py-1 text-xs bg-red-50 text-error rounded-lg hover:bg-red-100">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex justify-between items-center">
            <p className="text-sm text-text-secondary">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchBookings(pagination.page - 1)}
                className="p-2 rounded-lg border border-border hover:bg-bg disabled:opacity-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchBookings(pagination.page + 1)}
                className="p-2 rounded-lg border border-border hover:bg-bg disabled:opacity-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Rooms Page
const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/admin/rooms');
        setRooms(res.data.data.rooms);
      } catch {
        toast.error('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const toggleAvailability = async (room) => {
    try {
      await api.put(`/rooms/${room.id}`, { is_available: !room.is_available });
      toast.success(`Room ${room.room_number} availability updated`);
      setRooms(rooms.map(r => r.id === room.id ? { ...r, is_available: !r.is_available } : r));
    } catch {
      toast.error('Failed to update room');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text mb-6">Room Management</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Room</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Price</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Capacity</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="6" className="px-5 py-4"><div className="h-6 skeleton rounded"></div></td></tr>
                ))
              ) : rooms.map(room => (
                <tr key={room.id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-5 py-4 font-bold">{room.room_number}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      room.room_type === 'Suite' ? 'bg-purple-50 text-purple-600' :
                      room.room_type === 'Deluxe' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>{room.room_type}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-accent">₹{parseFloat(room.price_per_night).toLocaleString()}</td>
                  <td className="px-5 py-4">{room.max_occupancy} guests</td>
                  <td className="px-5 py-4">
                    <span className={`w-3 h-3 rounded-full inline-block ${room.is_available ? 'bg-success' : 'bg-error'}`}></span>
                    <span className="ml-2 text-xs">{room.is_available ? 'Available' : 'Unavailable'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleAvailability(room)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        room.is_available ? 'bg-red-50 text-error hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}>
                      {room.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main Admin Layout
const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [isAdmin, loading]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen pt-20 bg-bg">
      <div className="gradient-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7" /> Admin Dashboard
          </h1>
          <p className="text-white/60 text-sm mt-1">Manage bookings, rooms, and guests</p>
          <div className="flex gap-3 mt-4">
            <Link to="/admin" className="px-4 py-2 text-sm rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Overview</Link>
            <Link to="/admin/bookings" className="px-4 py-2 text-sm rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">All Bookings</Link>
            <Link to="/admin/rooms" className="px-4 py-2 text-sm rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Rooms</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<AdminStats />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="rooms" element={<AdminRooms />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
