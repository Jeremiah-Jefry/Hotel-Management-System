const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { Booking, Room, User, Payment } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { generateQRCode } = require('../utils/qrGenerator');

const router = express.Router();

// All admin routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats — dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalBookings = await Booking.count();

    const totalRevenue = await Payment.sum('amount', {
      where: { status: 'success' }
    }) || 0;

    const roomsOccupied = await Booking.count({
      where: {
        status: { [Op.in]: ['confirmed', 'checked_in'] },
        check_in_date: { [Op.lte]: today },
        check_out_date: { [Op.gt]: today }
      }
    });

    const activeGuests = await Booking.count({
      where: { status: 'checked_in' }
    });

    const totalRooms = await Room.count();

    const recentBookings = await Booking.findAll({
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Payment, as: 'payment' }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalBookings,
          totalRevenue: parseFloat(totalRevenue),
          roomsOccupied,
          activeGuests,
          totalRooms
        },
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/bookings/:id/checkin
router.put('/bookings/:id/checkin', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Room, as: 'room' }, { model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in. Current status: ${booking.status}. Must be 'confirmed'.`
      });
    }

    await booking.update({ status: 'checked_in' });

    res.json({
      success: true,
      message: 'Guest checked in successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/bookings/:id/checkout
router.put('/bookings/:id/checkout', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Room, as: 'room' }, { model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out. Current status: ${booking.status}. Must be 'checked_in'.`
      });
    }

    await booking.update({ status: 'checked_out' });

    res.json({
      success: true,
      message: 'Guest checked out successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/bookings/:id/cancel
router.put('/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['checked_out', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel. Current status: ${booking.status}.`
      });
    }

    await booking.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Booking cancelled by admin',
      data: { booking }
    });
  } catch (error) {
    console.error('Admin cancel error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/rooms — all rooms with booking status
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.findAll({
      order: [['room_number', 'ASC']]
    });

    res.json({ success: true, data: { rooms } });
  } catch (error) {
    console.error('Get admin rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
