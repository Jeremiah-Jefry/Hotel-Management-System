import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const Rooms = () => {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'All',
    maxPrice: 5000,
    minPrice: 0,
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type !== 'All') params.type = filters.type;
      if (filters.checkIn) params.checkIn = filters.checkIn;
      if (filters.checkOut) params.checkOut = filters.checkOut;
      if (filters.minPrice > 0) params.minPrice = filters.minPrice;
      if (filters.maxPrice < 5000) params.maxPrice = filters.maxPrice;

      const res = await api.get('/rooms', { params });
      setRooms(res.data.data.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const roomTypes = ['All', 'Standard', 'Deluxe', 'Suite'];

  return (
    <div className="min-h-screen pt-20 bg-bg">
      {/* Header */}
      <div className="gradient-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Our Rooms</h1>
          <p className="text-white/60">Find the perfect room for your stay. {rooms.length} rooms available.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Mobile filter toggle */}
        <button onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium mb-4 shadow-sm">
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 sticky top-24">
              <h3 className="text-lg font-bold text-text mb-6">Filters</h3>

              {/* Room Type */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 block">Room Type</label>
                <div className="space-y-2">
                  {roomTypes.map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer group">
                      <input type="radio" name="type" value={type} checked={filters.type === type}
                        onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                        className="w-4 h-4 text-accent accent-accent" />
                      <span className="text-sm text-text group-hover:text-accent transition-colors">{type}</span>
                      {type === 'Standard' && <span className="text-xs text-text-secondary ml-auto">₹1,500</span>}
                      {type === 'Deluxe' && <span className="text-xs text-text-secondary ml-auto">₹2,500</span>}
                      {type === 'Suite' && <span className="text-xs text-text-secondary ml-auto">₹4,000</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 block">
                  Price Range: ₹{filters.minPrice.toLocaleString()} — ₹{filters.maxPrice.toLocaleString()}
                </label>
                <input type="range" min="0" max="5000" step="500" value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: parseInt(e.target.value) }))}
                  className="w-full accent-accent" />
              </div>

              {/* Check-in / Check-out */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Check-in</label>
                <input type="date" value={filters.checkIn}
                  onChange={e => setFilters(f => ({ ...f, checkIn: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-3 focus:ring-2 focus:ring-accent outline-none" />
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Check-out</label>
                <input type="date" value={filters.checkOut}
                  onChange={e => setFilters(f => ({ ...f, checkOut: e.target.value }))}
                  min={filters.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>

              <button onClick={() => setFilters({ type: 'All', maxPrice: 5000, minPrice: 0, checkIn: '', checkOut: '' })}
                className="w-full py-2 text-sm text-text-secondary hover:text-text border border-border rounded-lg hover:bg-bg transition-all">
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Room Cards Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-48 skeleton"></div>
                    <div className="p-5">
                      <div className="h-5 skeleton mb-3 w-2/3"></div>
                      <div className="h-4 skeleton mb-2 w-full"></div>
                      <div className="h-4 skeleton mb-4 w-1/2"></div>
                      <div className="h-10 skeleton rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">📍</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">No rooms found</h3>
                <p className="text-text-secondary">Try adjusting your filters or dates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.map((room, idx) => {
                  const available = room.is_available_for_dates !== false && room.is_available;
                  return (
                    <div key={room.id} className="flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="relative w-full h-48 overflow-hidden">
                        <img src={room.image_url} alt={`Room ${room.room_number}`}
                          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-full text-primary shadow-sm">
                            {room.room_type}
                          </span>
                          <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-xs font-medium rounded-full text-text-secondary shadow-sm">
                            Room {room.room_number}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`w-3 h-3 rounded-full inline-block ${available ? 'bg-success' : 'bg-error'} shadow-sm`}></span>
                        </div>
                      </div>
                      <div className="flex flex-col flex-grow p-5 gap-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-gray-800 font-semibold text-base mb-1">{room.room_type} Room</h3>
                          <div className="text-right">
                            <span className="text-[#1E3A5F] font-bold text-lg">₹{parseFloat(room.price_per_night).toLocaleString()}</span>
                            <span className="text-xs text-text-secondary block">/night</span>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{room.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">{room.max_occupancy} guests</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">WiFi</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">AC</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">TV</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                          {(room.amenities || []).slice(0, 3).map((a, i) => (
                            <span key={i} className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">{a}</span>
                          ))}
                          {(room.amenities || []).length > 3 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">+{room.amenities.length - 3} more</span>
                          )}
                          </div>
                        <Link to={`/rooms/${room.id}${filters.checkIn ? `?checkIn=${filters.checkIn}&checkOut=${filters.checkOut}` : ''}`}
                          className={`bg-[#F59E0B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:brightness-110 transition whitespace-nowrap ${
                            available
                              ? ''
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}>
                          {available ? 'View Details' : 'Not Available'}
                        </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
