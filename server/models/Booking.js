const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rooms',
      key: 'id'
    }
  },
  check_in_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_out_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isAfterCheckIn(value) {
        if (value <= this.check_in_date) {
          throw new Error('Check-out date must be after check-in date');
        }
      }
    }
  },
  total_nights: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Must book at least 1 night' }
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  qr_code_data: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  payment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'payments',
      key: 'id'
    }
  },
  guest_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'bookings'
});

module.exports = Booking;
