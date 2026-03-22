const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 PNG data URL.
 * The QR encodes booking information as a JSON string.
 * @param {Object} bookingData - { bookingId, checkIn, checkOut, roomNumber, guestName }
 * @returns {Promise<string>} Base64 encoded PNG data URL
 */
const generateQRCode = async (bookingData) => {
  try {
    const startTime = Date.now();
    
    const qrData = JSON.stringify({
      bookingId: bookingData.bookingId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      roomNumber: bookingData.roomNumber,
      guestName: bookingData.guestName
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1E3A5F',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ QR Code generated in ${elapsed}ms`);

    return qrCodeDataUrl;
  } catch (error) {
    console.error('❌ QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateQRCode };
