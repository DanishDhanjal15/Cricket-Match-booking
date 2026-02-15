import { QRCodeSVG } from 'qrcode.react';

export const generateQRData = (bookingData) => {
    const qrData = {
        bookingId: bookingData.id,
        userId: bookingData.userId,
        matchId: bookingData.matchId,
        seats: bookingData.seats,
        timestamp: Date.now()
    };
    return JSON.stringify(qrData);
};

export const parseQRData = (qrString) => {
    try {
        return JSON.parse(qrString);
    } catch (error) {
        console.error('Error parsing QR data:', error);
        return null;
    }
};

export const QRCodeComponent = ({ value, size = 256 }) => {
    return (
        <QRCodeSVG
            value={value}
            size={size}
            level="H"
            includeMargin={true}
        />
    );
};

export default {
    generateQRData,
    parseQRData,
    QRCodeComponent
};
