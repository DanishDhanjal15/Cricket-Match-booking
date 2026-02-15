import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, getMatchById } from '../services/firestore';
import { generateQRData, QRCodeComponent } from '../services/qrcode.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './UserDashboard.css';

const UserDashboard = () => {
    const { currentUser, userProfile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchBookings();
        }
    }, [currentUser]);

    const fetchBookings = async () => {
        try {
            const userBookings = await getUserBookings(currentUser.uid);

            // Filter only confirmed bookings
            const confirmedBookings = userBookings.filter(b => b.status === 'confirmed');

            // Fetch match details for each confirmed booking
            const bookingsWithMatches = await Promise.all(
                confirmedBookings.map(async (booking) => {
                    const match = await getMatchById(booking.matchId);
                    return { ...booking, match };
                })
            );

            setBookings(bookingsWithMatches);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadQRCode = (bookingId) => {
        const canvas = document.querySelector(`#qr-${bookingId} canvas`);
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `ticket-${bookingId}.png`;
            link.href = url;
            link.click();
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return <LoadingSpinner message="Loading your tickets..." />;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>My Tickets</h1>
                <p>Welcome back, {userProfile?.name || 'User'}!</p>
            </div>

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <h2>No bookings yet</h2>
                    <p>Book your first cricket match ticket!</p>
                    <a href="/" className="btn btn-primary">Browse Matches</a>
                </div>
            ) : (
                <div className="bookings-grid">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="ticket-card">
                            <div className="ticket-header">
                                <span className={`status-badge ${booking.status}`}>
                                    {booking.status}
                                </span>
                                <span className="booking-id">#{booking.id.slice(0, 8)}</span>
                            </div>

                            <div className="ticket-match-info">
                                <h3>{booking.match?.team1} vs {booking.match?.team2}</h3>
                                <p>📅 {formatDate(booking.match?.date)}</p>
                                <p>📍 {booking.match?.venue}</p>
                                <p>💺 Seats: {booking.seats.join(', ')}</p>
                            </div>

                            {booking.status === 'confirmed' && (
                                <div className="qr-code-section" id={`qr-${booking.id}`}>
                                    <QRCodeComponent
                                        value={generateQRData(booking)}
                                        size={200}
                                    />
                                    <button
                                        onClick={() => downloadQRCode(booking.id)}
                                        className="btn-download"
                                    >
                                        Download QR Code
                                    </button>
                                </div>
                            )}

                            <div className="ticket-footer">
                                <span className="amount">₹{booking.amount}</span>
                                <span className="date">{formatDate(booking.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
