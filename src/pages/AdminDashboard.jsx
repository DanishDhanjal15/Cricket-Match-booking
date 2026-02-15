import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import QRScanner from '../components/Admin/QRScanner';
import { subscribeToAllBookings, subscribeToAllMatches, getMatchById, getUserProfile } from '../services/firestore';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = ({ initialTab = 'stats' }) => {
    const [bookings, setBookings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTickets: 0,
        activeMatches: 0,
        avgBooking: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeBookings;
        let unsubscribeMatches;

        const setupSubscriptions = () => {
            // Subscribe to matches
            unsubscribeMatches = subscribeToAllMatches((allMatches) => {
                setMatches(allMatches);
            });

            // Subscribe to bookings and enrich them
            unsubscribeBookings = subscribeToAllBookings(async (allBookings) => {
                try {
                    if (allBookings.length === 0) {
                        setBookings([]);
                        setLoading(false);
                        return;
                    }

                    const enrichedBookings = await Promise.all(
                        allBookings.map(async (booking) => {
                            try {
                                const [match, user] = await Promise.all([
                                    getMatchById(booking.matchId).catch(() => null),
                                    getUserProfile(booking.userId).catch(() => null)
                                ]);
                                return { ...booking, match, user };
                            } catch (err) {
                                console.error(`Error enriching booking ${booking.id}:`, err);
                                return { ...booking, match: null, user: null };
                            }
                        })
                    );

                    setBookings(enrichedBookings);
                } catch (error) {
                    console.error('Error in bookings transition:', error);
                } finally {
                    setLoading(false);
                }
            });
        };

        setupSubscriptions();

        return () => {
            if (unsubscribeBookings) unsubscribeBookings();
            if (unsubscribeMatches) unsubscribeMatches();
        };
    }, []);

    // Recalculate stats whenever bookings or matches change
    useEffect(() => {
        const revenue = bookings.reduce((sum, b) => sum + b.amount, 0);
        const tickets = bookings.reduce((sum, b) => sum + b.seats.length, 0);
        const activeMatchesCount = matches.filter(m => m.status !== 'deleted').length;

        setStats({
            totalRevenue: revenue,
            totalTickets: tickets,
            activeMatches: activeMatchesCount,
            avgBooking: bookings.length ? Math.round(revenue / bookings.length) : 0
        });
    }, [bookings, matches]);

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

    return (
        <div className="admin-dashboard">
            {initialTab === 'stats' && (
                <div className="stats-dashboard">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-icon">💰</span>
                            <div className="stat-info">
                                <h3>Total Revenue</h3>
                                <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🎟️</span>
                            <div className="stat-info">
                                <h3>Tickets Sold</h3>
                                <p className="stat-value">{stats.totalTickets}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🏏</span>
                            <div className="stat-info">
                                <h3>Active Matches</h3>
                                <p className="stat-value">{stats.activeMatches}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">📈</span>
                            <div className="stat-info">
                                <h3>Avg. Booking</h3>
                                <p className="stat-value">₹{stats.avgBooking}</p>
                            </div>
                        </div>
                    </div>

                    <div className="recent-activity">
                        <h3>Recent Bookings</h3>
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Match</th>
                                        <th>Amount</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.slice(0, 5).map(booking => (
                                        <tr key={booking.id}>
                                            <td>{booking.user?.name || 'Guest'}</td>
                                            <td>{booking.match?.team1} vs {booking.match?.team2}</td>
                                            <td>₹{booking.amount}</td>
                                            <td>{formatDate(booking.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {initialTab === 'bookings' && (
                <div className="bookings-section">
                    <div className="section-header">
                        <h2>All Confirmed Bookings</h2>
                        <span className="count-badge">{bookings.length} Bookings</span>
                    </div>

                    {loading ? (
                        <LoadingSpinner message="Fetching bookings..." />
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
                                            <td><code className="booking-id-tag">#{booking.id.slice(0, 8)}</code></td>
                                            <td>
                                                <div className="user-info">
                                                    <span className="name">{booking.user?.name || 'Unknown'}</span>
                                                    <span className="sub">{booking.user?.email || ''}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="match-info">
                                                    <span>{booking.match?.team1} vs {booking.match?.team2}</span>
                                                    <span className="sub">{booking.match?.venue}</span>
                                                </div>
                                            </td>
                                            <td>{booking.seats.join(', ')}</td>
                                            <td><strong>₹{booking.amount}</strong></td>
                                            <td>{formatDate(booking.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
