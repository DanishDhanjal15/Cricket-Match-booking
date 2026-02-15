// Load Razorpay script
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Initialize Razorpay payment
export const initiatePayment = async (bookingData, onSuccess, onFailure) => {
    const res = await loadRazorpayScript();

    if (!res) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        return;
    }

    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: bookingData.amount * 100, // Convert to paise
        currency: 'INR',
        name: 'CricketBook',
        description: `Booking for ${bookingData.matchName}`,
        image: '/cricket-icon.png',
        handler: function (response) {
            onSuccess({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
            });
        },
        prefill: {
            name: bookingData.userName,
            email: bookingData.userEmail,
            contact: bookingData.userPhone
        },
        notes: {
            bookingId: bookingData.bookingId,
            matchId: bookingData.matchId
        },
        theme: {
            color: '#667eea'
        },
        modal: {
            ondismiss: function () {
                onFailure('Payment cancelled by user');
            }
        }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
};

export default {
    loadRazorpayScript,
    initiatePayment
};
