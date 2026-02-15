import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import QRScanner from '../components/Admin/QRScanner';
import { getAllBookings, getMatchById, getUserProfile } from '../services/firestore';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('scanner');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'bookings') {
            fetchBookings();
        }
    }, [activeTab]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const allBookings = await getAllBookings();

            // Enrich bookings with match and user data
            const enrichedBookings = await Promise.all(
                allBookings.map(async (booking) => {
                    const [match, user] = await Promise.all([
                        getMatchById(booking.matchId),
                        getUserProfile(booking.userId)
                    ]);
                    return { ...booking, match, user };
                })
            );

            setBookings(enrichedBookings);
        } catch (error) {
            console.error('Error fetching admin bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (userProfile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="admin-dashboard-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage tickets and scan QR codes</p>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab ${activeTab === 'scanner' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scanner')}
                >
                    QR Scanner
                </button>
                <button
                    className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    All Bookings
                </button>
                <button
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Statistics
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'scanner' && <QRScanner />}
                {activeTab === 'bookings' && (
                    <div className="bookings-section">
                        <h2>Confirmed Bookings</h2>
                        {loading ? (
                            <LoadingSpinner message="Fetching all bookings..." />
                        ) : bookings.length === 0 ? (
                            <p className="no-data">No confirmed bookings found.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Booking ID</th>
                                            <th>User Info</th>
                                            <th>Match</th>
                                            <th>Seats</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td>#{booking.id.slice(0, 8)}</td>
                                                <td>
                                                    <div className="user-info">
                                                        <span className="name">{booking.user?.name || 'Unknown'}</span>
                                                        <span className="sub">{booking.user?.email || ''}</span>
                                                        <span className="sub">{booking.user?.phone || ''}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="match-info">
                                                        <span>{booking.match?.team1} vs {booking.match?.team2}</span>
                                                        <span className="sub">{booking.match?.venue}</span>
                                                    </div>
                                                </td>
                                                <td>{booking.seats.join(', ')}</td>
                                                <td>₹{booking.amount}</td>
                                                <td>{formatDate(booking.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'stats' && (
                    <div className="stats-section">
                        <h2>Statistics</h2>
                        <p>Statistics feature coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
