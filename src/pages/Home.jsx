import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToAllMatches } from '../services/firestore';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './Home.css';

const Home = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAllMatches((matchesData) => {
            // Filter out soft-deleted matches
            setMatches(matchesData.filter(m => m.status !== 'deleted'));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <LoadingSpinner message="Loading matches..." />;
    }

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Experience Cricket Like Never Before</h1>
                    <p className="hero-subtitle">Book your tickets for the most exciting cricket matches</p>
                </div>
            </section>

            <section className="matches-section">
                <h2>Upcoming Matches</h2>
                <div className="matches-grid">
                    {matches.length === 0 ? (
                        <p>No matches available</p>
                    ) : (
                        matches.map((match) => (
                            <div key={match.id} className="match-card">
                                <div className="match-header">
                                    <span className="match-type">{match.matchType}</span>
                                    <span className="match-date">{formatDate(match.date)}</span>
                                </div>
                                <div className="match-teams">
                                    <div className="team">
                                        <span className="team-flag">{match.team1Flag}</span>
                                        <span className="team-name">{match.team1}</span>
                                    </div>
                                    <span className="vs">VS</span>
                                    <div className="team">
                                        <span className="team-flag">{match.team2Flag}</span>
                                        <span className="team-name">{match.team2}</span>
                                    </div>
                                </div>
                                <div className="match-details">
                                    <p>📍 {match.venue}</p>
                                    <p>💺 {match.availableSeats} seats available</p>
                                </div>
                                <div className="match-footer">
                                    <span className="price">₹{match.basePrice}</span>
                                    <Link to={`/match/${match.id}`} className="btn btn-book">Book Now</Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
