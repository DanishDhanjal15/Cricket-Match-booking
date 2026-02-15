import emailjs from 'emailjs-com';
import { QRCodeSVG } from 'qrcode.react';

// Initialize EmailJS
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// Generate QR code URL using a public API
export const getQRCodeDataURL = (value) => {
    // We use a public QR code API to generate the image URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(value)}`;
};

// Send ticket confirmation email
export const sendTicketEmail = async (bookingData, qrCodeData) => {
    try {
        const templateParams = {
            to_email: bookingData.userEmail,
            to_name: bookingData.userName,
            match_name: bookingData.matchName,
            match_date: bookingData.matchDate,
            match_venue: bookingData.venue,
            seats: bookingData.seats.join(', '),
            total_amount: bookingData.amount,
            booking_id: bookingData.bookingId,
            qr_code: qrCodeData
        };

        const response = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams
        );

        return response;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export default {
    sendTicketEmail,
    getQRCodeDataURL
};
