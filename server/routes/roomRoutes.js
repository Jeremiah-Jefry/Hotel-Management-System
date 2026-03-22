const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// GET /api/rooms — list all rooms with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, available, checkIn, checkOut, minPrice, maxPrice, occupancy } = req.query;
    
    const where = {};

    if (type && type !== 'All') {
      where.room_type = type;
    }

    if (available === 'true') {
      where.is_available = true;
    }

    if (minPrice || maxPrice) {
      where.price_per_night = {};
      if (minPrice) where.price_per_night[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price_per_night[Op.lte] = parseFloat(maxPrice);
    }

    if (occupancy) {
      where.max_occupancy = { [Op.gte]: parseInt(occupancy) };
    }

    let rooms = await Room.findAll({ where, order: [['room_number', 'ASC']] });

    // Filter by date availability if checkIn and checkOut provided
    if (checkIn && checkOut) {
      const overlappingBookings = await Booking.findAll({
        where: {
          status: { [Op.notIn]: ['cancelled', 'checked_out'] },
          check_in_date: { [Op.lt]: checkOut },
          check_out_date: { [Op.gt]: checkIn }
        },
        attributes: ['room_id']
      });

      const bookedRoomIds = new Set(overlappingBookings.map(b => b.room_id));
      rooms = rooms.map(room => {
        const roomData = room.toJSON();
        roomData.is_available_for_dates = !bookedRoomIds.has(room.id);
        return roomData;
      });
    }

    res.json({
      success: true,
      data: { rooms, count: rooms.length }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/rooms/:id — single room detail
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: { room } });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/rooms — create room (admin only)
router.post('/', authMiddleware, adminMiddleware, [
  body('room_number').notEmpty().withMessage('Room number is required'),
  body('room_type').isIn(['Standard', 'Deluxe', 'Suite']).withMessage('Invalid room type'),
  body('price_per_night').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('max_occupancy').isInt({ min: 1 }).withMessage('Occupancy must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const room = await Room.create(req.body);
    res.status(201).json({ success: true, message: 'Room created', data: { room } });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Room number already exists' });
    }
    console.error('Create room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/rooms/:id — update room (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await room.update(req.body);
    res.json({ success: true, message: 'Room updated', data: { room } });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/rooms/:id — delete room (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await room.destroy();
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
