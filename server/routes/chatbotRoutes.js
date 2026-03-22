const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const SYSTEM_PROMPT = `You are HotelEase Assistant, a friendly hotel concierge chatbot. Only answer questions about: hotel booking, room types, pricing, check-in/out, amenities, and hotel policies.

Hotel info:
- Standard Room: ₹1,500/night (WiFi, AC, TV, Daily housekeeping)
- Deluxe Room: ₹2,500/night (WiFi, AC, TV, Mini fridge, City view, Room service)
- Suite: ₹4,000/night (WiFi, AC, TV, Jacuzzi, Living area, Premium minibar, Butler service)

Rooms: 101-104 (Standard), 201-204 (Deluxe), 301-302 (Suite)

Policies:
- Check-in: 2:00 PM
- Check-out: 11:00 AM
- Payment: Razorpay online payment (secure)
- QR code provided for contactless check-in after payment
- Free cancellation up to 24 hours before check-in
- Front desk emergencies: Dial Extension 0
- Maximum occupancy: Standard (2), Deluxe (3), Suite (4)

Be concise and friendly. If a question is unrelated to the hotel, politely redirect the conversation to hotel-related topics.`;

// POST /api/chatbot/message
router.post('/message', [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Fallback: rule-based responses when API key not configured
      const reply = getFallbackResponse(message);
      return res.json({ success: true, data: { reply } });
    }

    // Call Gemini API
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 500 }
    });

    const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n\nUser: ${message}`);
    const reply = result.response.text();

    res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error('Chatbot error:', error);
    // Return fallback response on error
    const reply = getFallbackResponse(req.body.message);
    res.json({ success: true, data: { reply } });
  }
});

function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('price') || msg.includes('cost') || msg.includes('rate') || msg.includes('pricing')) {
    return '🏨 Our room rates:\n\n• **Standard Room**: ₹1,500/night — WiFi, AC, TV\n• **Deluxe Room**: ₹2,500/night — + Mini fridge, City view\n• **Suite**: ₹4,000/night — + Jacuzzi, Living area, Butler service\n\nWould you like to book a room?';
  }

  if (msg.includes('check-in') || msg.includes('checkin') || msg.includes('check in')) {
    return '🕐 Check-in time is **2:00 PM**. After payment, you\'ll receive a QR code for contactless check-in at the lobby kiosk!';
  }

  if (msg.includes('check-out') || msg.includes('checkout') || msg.includes('check out')) {
    return '🕚 Check-out time is **11:00 AM**. Please ensure you check out before this time to avoid late charges.';
  }

  if (msg.includes('cancel') || msg.includes('refund')) {
    return '✅ We offer **free cancellation up to 24 hours** before your check-in date. You can cancel from your bookings page.';
  }

  if (msg.includes('amenit') || msg.includes('facility') || msg.includes('facilities')) {
    return '✨ Our amenities by room type:\n\n• **Standard**: WiFi, AC, TV, Daily housekeeping\n• **Deluxe**: + Mini fridge, City view, Room service\n• **Suite**: + Jacuzzi, Living area, Premium minibar, Butler service\n\nAll rooms include complimentary breakfast!';
  }

  if (msg.includes('room') || msg.includes('type')) {
    return '🏨 We have 3 room types:\n\n• **Standard** (Rooms 101-104): ₹1,500/night, up to 2 guests\n• **Deluxe** (Rooms 201-204): ₹2,500/night, up to 3 guests\n• **Suite** (Rooms 301-302): ₹4,000/night, up to 4 guests\n\nWould you like to check availability for specific dates?';
  }

  if (msg.includes('payment') || msg.includes('pay')) {
    return '💳 We accept online payments via **Razorpay** (credit/debit cards, UPI, net banking). After successful payment, you\'ll receive a QR code for contactless check-in.';
  }

  if (msg.includes('contact') || msg.includes('help') || msg.includes('emergency') || msg.includes('phone')) {
    return '📞 For emergencies, dial **Extension 0** from your room phone. For general inquiries, visit the front desk or use this chat!';
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return '👋 Hello! Welcome to HotelEase! I\'m your virtual concierge. I can help you with:\n\n• Room types & pricing\n• Check-in/Check-out times\n• Amenities & facilities\n• Booking & cancellation\n\nHow can I assist you today?';
  }

  if (msg.includes('book') || msg.includes('reserve') || msg.includes('reservation')) {
    return '📝 To make a booking:\n\n1. Browse our rooms on the **Rooms** page\n2. Select your dates and room type\n3. Fill in your details\n4. Complete payment via Razorpay\n5. Receive your QR code for check-in!\n\nThe entire process takes under 2 minutes!';
  }

  return '🏨 I\'m HotelEase Assistant! I can help with:\n\n• **Room Types & Pricing** — Standard, Deluxe, Suite\n• **Check-in/out** — 2 PM / 11 AM\n• **Amenities** — WiFi, AC, and more\n• **Booking & Cancellation**\n• **Payment** — Secure Razorpay\n\nWhat would you like to know?';
}

module.exports = router;
