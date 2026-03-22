const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Booking, Payment, Room, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { generateQRCode } = require('../utils/qrGenerator');

const router = express.Router();

// Detect if we have REAL Razorpay credentials (not placeholder/demo)
const rzpKeyId = process.env.RAZORPAY_KEY_ID || '';
const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const isRealRazorpay = rzpKeyId && rzpKeySecret &&
  !rzpKeyId.includes('placeholder') &&
  !rzpKeyId.includes('yourkeyid') &&
  !rzpKeyId.includes('your_') &&
  !rzpKeySecret.includes('placeholder') &&
  !rzpKeySecret.includes('yoursecret') &&
  !rzpKeySecret.includes('your_');

let razorpay;
if (isRealRazorpay) {
  try {
    razorpay = new Razorpay({ key_id: rzpKeyId, key_secret: rzpKeySecret });
    console.log('✅ Razorpay initialized with real credentials');
  } catch (err) {
    console.warn('⚠️ Razorpay initialization failed:', err.message);
  }
} else {
  console.log('🧪 Razorpay running in DEMO mode (simulated payments)');
}

// POST /api/payments/create-order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Room, as: 'room' }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const orderAmount = Math.round((amount || booking.total_amount) * 100); // Convert to paise

    let order;
    let isSimulated = false;

    if (razorpay && isRealRazorpay) {
      // Real Razorpay order
      order = await razorpay.orders.create({
        amount: orderAmount,
        currency: 'INR',
        receipt: `booking_${bookingId}`,
        notes: { bookingId }
      });
    } else {
      // Simulated order for demo/development
      isSimulated = true;
      order = {
        id: `order_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: orderAmount,
        currency: 'INR'
      };
    }

    // Create payment record
    const payment = await Payment.create({
      booking_id: bookingId,
      razorpay_order_id: order.id,
      amount: booking.total_amount,
      currency: 'INR',
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        paymentId: payment.id,
        isSimulated
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let isVerified = false;

    if (razorpayOrderId && razorpayOrderId.startsWith('order_sim_')) {
      // Simulated payment — auto-verify for demo
      isVerified = true;
    } else if (razorpaySignature) {
      // Real Razorpay signature verification
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
      isVerified = expectedSignature === razorpaySignature;
    } else {
      // Fallback for demo mode
      isVerified = true;
    }

    if (!isVerified) {
      // Update payment as failed
      await Payment.update(
        { status: 'failed', razorpay_payment_id: razorpayPaymentId },
        { where: { razorpay_order_id: razorpayOrderId } }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment as success
    await Payment.update(
      { status: 'success', razorpay_payment_id: razorpayPaymentId || `pay_sim_${Date.now()}` },
      { where: { razorpay_order_id: razorpayOrderId } }
    );

    // Generate QR code
    const qrCode = await generateQRCode({
      bookingId: booking.id,
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      roomNumber: booking.room.room_number,
      guestName: booking.user.name
    });

    // Update booking status and QR
    await booking.update({
      status: 'confirmed',
      qr_code_data: qrCode
    });

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      data: {
        booking: booking.toJSON(),
        qrCode
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;
