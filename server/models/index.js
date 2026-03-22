const User = require('./User');
const Room = require('./Room');
const Booking = require('./Booking');
const Payment = require('./Payment');

// Associations
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Room.hasMany(Booking, { foreignKey: 'room_id', as: 'bookings' });
Booking.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

module.exports = { User, Room, Booking, Payment };
