import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatchById, createBooking, updateBookingStatus } from '../services/firestore';
import { initiatePayment } from '../services/razorpay';
import { sendTicketEmail, getQRCodeDataURL } from '../services/email';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './MatchDetails.css';

const MatchDetails = () => {
    const { matchId } = useParams();
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchMatchDetails();
    }, [matchId]);

    const fetchMatchDetails = async () => {
        try {
            const matchData = await getMatchById(matchId);
            setMatch(matchData);
        } catch (error) {
            console.error('Error fetching match:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSeat = (seatNumber) => {
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
        } else {
            if (selectedSeats.length < 10) {
                setSelectedSeats([...selectedSeats, seatNumber]);
            } else {
                alert('You can select maximum 10 seats');
            }
        }
    };

    const handleBooking = async () => {
        if (!currentUser) {
            alert('Please login to book tickets');
            navigate('/login');
            return;
        }

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

        try {
            setProcessing(true);

            // Create booking in Firestore
            const bookingData = {
                userId: currentUser.uid,
                matchId: match.id,
                seats: selectedSeats,
                amount: selectedSeats.length * match.basePrice,
                status: 'pending'
            };

            const bookingId = await createBooking(bookingData);

            // Initiate Razorpay payment
            const paymentData = {
                bookingId,
                matchId: match.id,
                matchName: `${match.team1} vs ${match.team2}`,
                amount: selectedSeats.length * match.basePrice,
                userName: userProfile?.name || 'User',
                userEmail: currentUser.email,
                userPhone: userProfile?.phone || ''
            };

            initiatePayment(
                paymentData,
                async (paymentResponse) => {
                    try {
                        // Payment successful
                        await updateBookingStatus(bookingId, 'confirmed', {
                            paymentId: paymentResponse.razorpay_payment_id,
                            paymentMethod: 'razorpay'
                        });

                        // Send confirmation email
                        try {
                            const qrCodeData = await getQRCodeDataURL(JSON.stringify({
                                bookingId,
                                userId: currentUser.uid,
                                matchId: match.id,
                                seats: selectedSeats
                            }));

                            await sendTicketEmail({
                                userEmail: currentUser.email,
                                userName: userProfile?.name || 'User',
                                matchName: `${match.team1} vs ${match.team2}`,
                                matchDate: formatDate(match.date),
                                venue: match.venue,
                                seats: selectedSeats,
                                amount: selectedSeats.length * match.basePrice,
                                bookingId
                            }, qrCodeData);
                        } catch (emailError) {
                            console.error('Failed to send confirmation email:', emailError);
                            // Don't alert here, we don't want to ruin the success experience
                        }

                        alert('Booking confirmed! Check your dashboard and email for tickets.');
                        navigate('/dashboard');
                    } catch (error) {
                        console.error('Error confirming booking:', error);
                        alert('Payment was successful, but there was an error updating your booking: ' + error.message + '\n\nPlease contact support with your Payment ID: ' + paymentResponse.razorpay_payment_id);
                        setProcessing(false);
                    }
                },
                (error) => {
                    // Payment failed
                    console.error('Payment failed:', error);
                    alert('Payment failed. Please try again.');
                    setProcessing(false);
                }
            );
        } catch (error) {
            console.error('Booking error:', error);
            alert('Booking failed. Please try again.');
            setProcessing(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <LoadingSpinner message="Loading match details..." />;
    }

    if (!match) {
        return (
            <div className="error-container">
                <h2>Match not found</h2>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    Back to Home
                </button>
            </div>
        );
    }

    const totalAmount = selectedSeats.length * match.basePrice;

    return (
        <div className="match-details-container">
            <div className="match-header-section">
                <h1>{match.team1} vs {match.team2}</h1>
                <div className="match-info">
                    <p>📅 {formatDate(match.date)}</p>
                    <p>📍 {match.venue}</p>
                    <p>🏏 {match.matchType}</p>
                </div>
            </div>

            <div className="booking-section">
                <div className="seat-selection">
                    <h2>Select Your Seats</h2>
                    <p className="seat-info">Click on seats to select (Max 10 seats)</p>

                    <div className="stadium-view">
                        <div className="pitch">PITCH</div>
                        <div className="seats-grid">
                            {Array.from({ length: 50 }, (_, i) => i + 1).map((seatNum) => (
                                <button
                                    key={seatNum}
                                    className={`seat ${selectedSeats.includes(seatNum) ? 'selected' : ''}`}
                                    onClick={() => toggleSeat(seatNum)}
                                    disabled={processing}
                                >
                                    {seatNum}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="seat-legend">
                        <div className="legend-item">
                            <span className="seat available"></span>
                            <span>Available</span>
                        </div>
                        <div className="legend-item">
                            <span className="seat selected"></span>
                            <span>Selected</span>
                        </div>
                    </div>
                </div>

                <div className="booking-summary">
                    <h2>Booking Summary</h2>
                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Selected Seats:</span>
                            <span>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
                        </div>
                        <div className="summary-row">
                            <span>Price per seat:</span>
                            <span>₹{match.basePrice}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Amount:</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-book-now"
                        onClick={handleBooking}
                        disabled={selectedSeats.length === 0 || processing}
                    >
                        {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchDetails;
