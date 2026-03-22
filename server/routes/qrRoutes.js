const express = require('express');
const { Booking, Room, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/qr/:bookingId — get QR code for a booking
router.get('/:bookingId', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId, {
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership or admin
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!booking.qr_code_data) {
      return res.status(404).json({
        success: false,
        message: 'QR code not yet generated. Complete payment first.'
      });
    }

    res.json({
      success: true,
      data: {
        qrCode: booking.qr_code_data,
        booking: {
          id: booking.id,
          room_number: booking.room.room_number,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          status: booking.status,
          guest_name: booking.user.name
        }
      }
    });
  } catch (error) {
    console.error('Get QR error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
