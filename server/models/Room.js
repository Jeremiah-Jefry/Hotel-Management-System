const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  room_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  room_type: {
    type: DataTypes.ENUM('Standard', 'Deluxe', 'Suite'),
    allowNull: false
  },
  price_per_night: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Price must be a positive number' }
    }
  },
  max_occupancy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
    validate: {
      min: { args: [1], msg: 'Occupancy must be at least 1' }
    }
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'rooms'
});

module.exports = Room;
