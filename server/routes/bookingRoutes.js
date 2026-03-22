const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Booking, Room, User, Payment } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// POST /api/bookings — create new booking with double-booking prevention
router.post('/', authMiddleware, [
  body('room_id').notEmpty().withMessage('Room ID is required'),
  body('check_in_date').isDate().withMessage('Valid check-in date required'),
  body('check_out_date').isDate().withMessage('Valid check-out date required'),
  body('guest_phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { room_id, check_in_date, check_out_date, guest_phone } = req.body;

    // Verify room exists
    const room = await Room.findByPk(room_id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (!room.is_available) {
      return res.status(400).json({ success: false, message: 'Room is not available' });
    }

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    // CRITICAL: Double booking prevention — check for overlapping bookings
    const overlapping = await Booking.findOne({
      where: {
        room_id: room_id,
        status: { [Op.notIn]: ['cancelled', 'checked_out'] },
        check_in_date: { [Op.lt]: check_out_date },
        check_out_date: { [Op.gt]: check_in_date }
      }
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'Room is already booked for the selected dates. Please choose different dates.'
      });
    }

    // Calculate nights and amount
    const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = totalNights * parseFloat(room.price_per_night);

    const booking = await Booking.create({
      user_id: req.user.id,
      room_id,
      check_in_date,
      check_out_date,
      total_nights: totalNights,
      total_amount: totalAmount,
      status: 'pending',
      guest_phone
    });

    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Booking created',
      data: { booking: bookingWithDetails }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/bookings/my — all bookings for logged-in user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Room, as: 'room' },
        { model: Payment, as: 'payment' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { bookings, count: bookings.length }
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/bookings/all — all bookings (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Payment, as: 'payment' }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/bookings/:id — single booking
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check permission: owner or admin
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/bookings/:id/cancel — cancel a booking
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    await booking.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
