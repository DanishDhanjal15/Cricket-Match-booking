import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { parseQRData } from '../../services/qrcode.jsx';
import { getBookingById, checkIfTicketScanned, recordScannedTicket, getUserProfile } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import './QRScanner.css';

const QRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        startScanner();
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, []);

    const startScanner = () => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: 250 },
            false
        );

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;
        setScanning(true);
    };

    const onScanSuccess = async (decodedText) => {
        try {
            setError('');
            const qrData = parseQRData(decodedText);

            if (!qrData || !qrData.bookingId) {
                setError('Invalid QR code');
                return;
            }

            // Fetch booking details
            const booking = await getBookingById(qrData.bookingId);

            if (!booking) {
                setError('Booking not found');
                return;
            }

            if (booking.status !== 'confirmed') {
                setError('Ticket not confirmed');
                return;
            }

            // Check if already scanned
            const alreadyScanned = await checkIfTicketScanned(qrData.bookingId);

            if (alreadyScanned) {
                setScanResult({
                    ...booking,
                    warning: 'This ticket has already been scanned!'
                });
                return;
            }

            // Fetch user profile
            const user = await getUserProfile(booking.userId);

            setScanResult({
                ...booking,
                user,
                success: true
            });

        } catch (error) {
            console.error('Scan error:', error);
            setError('Error processing QR code');
        }
    };

    const onScanError = (errorMessage) => {
        // Ignore continuous scanning errors
        if (!errorMessage.includes('NotFoundException')) {
            console.error('Scan error:', errorMessage);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setError('');
    };

    return (
        <div className="qr-scanner-container">
            <h2>Scan Ticket QR Code</h2>

            {!scanResult && (
                <div id="qr-reader" className="qr-reader"></div>
            )}

            {error && (
                <div className="scan-error">
                    ❌ {error}
                    <button onClick={resetScanner} className="btn-reset">Try Again</button>
                </div>
            )}

            {scanResult && (
                <div className={`scan-result ${scanResult.warning ? 'warning' : 'success'}`}>
                    {scanResult.warning ? (
                        <div className="result-header warning">
                            ⚠️ Warning: Duplicate Scan
                        </div>
                    ) : (
                        <div className="result-header success">
                            ✅ Valid Ticket
                        </div>
                    )}

                    <div className="result-details">
                        <h3>Booking Details</h3>
                        <p><strong>Booking ID:</strong> {scanResult.id}</p>
                        <p><strong>Seats:</strong> {scanResult.seats.join(', ')}</p>
                        <p><strong>Amount:</strong> ₹{scanResult.amount}</p>
                        <p><strong>Status:</strong> {scanResult.status}</p>

                        <div className="scanned-user-info">
                            <h3>User Information</h3>
                            <p><strong>Name:</strong> {scanResult.user?.name || 'N/A'}</p>
                            <p><strong>Email:</strong> {scanResult.user?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {scanResult.user?.phone || 'N/A'}</p>
                        </div>
                    </div>

                    <button onClick={resetScanner} className="btn btn-primary">
                        Scan Next Ticket
                    </button>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
