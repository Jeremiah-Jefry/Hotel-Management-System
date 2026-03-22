import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Shield, Lock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, order, room } = location.state || {};
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!booking || !order) {
      toast.error('No payment information found');
      navigate('/rooms');
    }
  }, [booking, order]);

  if (!booking || !order) return null;

  const handlePayment = async () => {
    setProcessing(true);

    // Check if Razorpay is available and has real keys
    if (order.isSimulated || !window.Razorpay) {
      // Simulated payment for demo
      try {
        const verifyRes = await api.post('/payments/verify', {
          razorpayOrderId: order.orderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'simulated',
          bookingId: booking.id
        });

        toast.success('Payment successful! 🎉');
        navigate(`/confirmation/${booking.id}`, {
          state: { booking: verifyRes.data.data.booking, qrCode: verifyRes.data.data.qrCode }
        });
      } catch (err) {
        toast.error('Payment verification failed');
        setProcessing(false);
      }
      return;
    }

    // Real Razorpay payment
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'HotelEase',
      description: `Room Booking - ${room?.room_type || ''} Room ${room?.room_number || ''}`,
      order_id: order.orderId,
      handler: async (response) => {
        try {
          const verifyRes = await api.post('/payments/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            bookingId: booking.id
          });

          toast.success('Payment verified! 🎉');
          navigate(`/confirmation/${booking.id}`, {
            state: { booking: verifyRes.data.data.booking, qrCode: verifyRes.data.data.qrCode }
          });
        } catch (err) {
          toast.error('Payment verification failed');
        }
        setProcessing(false);
      },
      prefill: {
        name: booking.user?.name,
        email: booking.user?.email,
        contact: booking.guest_phone
      },
      theme: { color: '#1E3A5F' }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen pt-20 bg-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Room', 'Details', 'Payment', 'Confirm'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i <= 2 ? 'bg-accent text-primary-dark' : 'bg-gray-200 text-gray-500'
              }`}>{i + 1}</div>
              <span className={`text-sm font-medium hidden sm:block ${i <= 2 ? 'text-text' : 'text-text-secondary'}`}>{step}</span>
              {i < 3 && <div className={`w-8 h-0.5 ${i < 2 ? 'bg-accent' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sm:p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text">Complete Payment</h2>
            <p className="text-sm text-text-secondary mt-1">Secure payment powered by Razorpay</p>
          </div>

          {/* Order Summary */}
          <div className="bg-bg rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-text mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Room</span>
                <span className="font-medium">{room?.room_type} - Room {room?.room_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Check-in</span>
                <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Check-out</span>
                <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Duration</span>
                <span className="font-medium">{booking.total_nights} night{booking.total_nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Booking ID</span>
                <span className="font-mono text-xs">{booking.id?.slice(0, 8)}...</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-text">Total</span>
                <span className="font-bold text-accent">₹{parseFloat(booking.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Security info */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl mb-6">
            <Shield className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700">
              Your payment is secured with 256-bit encryption and HMAC SHA256 signature verification.
            </p>
          </div>

          <button onClick={handlePayment} disabled={processing}
            className="w-full py-4 bg-accent hover:bg-accent-dark text-primary-dark font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 text-base">
            {processing ? (
              <><span className="w-5 h-5 border-2 border-primary-dark border-t-transparent rounded-full animate-spin"></span> Processing...</>
            ) : (
              <><Lock className="w-5 h-5" /> Pay ₹{parseFloat(booking.total_amount).toLocaleString()}</>
            )}
          </button>

          {order.isSimulated && (
            <p className="text-xs text-center text-text-secondary mt-3">
              🧪 Demo mode: Payment will be simulated. No real charges.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
