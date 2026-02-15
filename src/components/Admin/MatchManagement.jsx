import { useState, useEffect } from 'react';
import { subscribeToAllMatches, createMatch, deleteMatch } from '../../services/firestore';
import LoadingSpinner from '../UI/LoadingSpinner';
import './MatchManagement.css';

const MatchManagement = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newMatch, setNewMatch] = useState({
        team1: '',
        team1Flag: '',
        team2: '',
        team2Flag: '',
        matchType: 'T20',
        venue: '',
        date: '',
        basePrice: '',
        availableSeats: '',
    });

    useEffect(() => {
        const unsubscribe = subscribeToAllMatches((data) => {
            setMatches(data.filter(m => m.status !== 'deleted'));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateMatch = async (e) => {
        e.preventDefault();
        try {
            const matchData = {
                ...newMatch,
                basePrice: Number(newMatch.basePrice),
                availableSeats: Number(newMatch.availableSeats),
                date: new Date(newMatch.date)
            };
            await createMatch(matchData);
            setShowModal(false);
            setNewMatch({
                team1: '',
                team1Flag: '',
                team2: '',
                team2Flag: '',
                matchType: 'T20',
                venue: '',
                date: '',
                basePrice: '',
                availableSeats: '',
            });
        } catch (error) {
            console.error('Error creating match:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this match?')) {
            try {
                await deleteMatch(id);
            } catch (error) {
                console.error('Error deleting match:', error);
            }
        }
    };

    return (
        <div className="match-management">
            <div className="section-header">
                <h2>Match Management</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Schedule New Match
                </button>
            </div>

            {loading ? (
                <LoadingSpinner message="Loading matches..." />
            ) : (
                <div className="matches-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th>Venue</th>
                                <th>Date & Time</th>
                                <th>Capacity</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) => (
                                <tr key={match.id}>
                                    <td>
                                        <div className="team-cell">
                                            <span>{match.team1Flag} {match.team1}</span>
                                            <span className="vs">vs</span>
                                            <span>{match.team2Flag} {match.team2}</span>
                                            <span className="badge">{match.matchType}</span>
                                        </div>
                                    </td>
                                    <td>{match.venue}</td>
                                    <td>{new Date(match.date?.toDate ? match.date.toDate() : match.date).toLocaleString()}</td>
                                    <td>{match.availableSeats}</td>
                                    <td>₹{match.basePrice}</td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn-icon delete" onClick={() => handleDelete(match.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Schedule New Match</h3>
                        <form onSubmit={handleCreateMatch} className="match-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Team 1 Name</label>
                                    <input type="text" value={newMatch.team1} onChange={e => setNewMatch({ ...newMatch, team1: e.target.value })} required placeholder="e.g. India" />
                                </div>
                                <div className="form-group">
                                    <label>Team 1 Flag (Emoji)</label>
                                    <input type="text" value={newMatch.team1Flag} onChange={e => setNewMatch({ ...newMatch, team1Flag: e.target.value })} required placeholder="🇮🇳" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Team 2 Name</label>
                                    <input type="text" value={newMatch.team2} onChange={e => setNewMatch({ ...newMatch, team2: e.target.value })} required placeholder="e.g. Australia" />
                                </div>
                                <div className="form-group">
                                    <label>Team 2 Flag (Emoji)</label>
                                    <input type="text" value={newMatch.team2Flag} onChange={e => setNewMatch({ ...newMatch, team2Flag: e.target.value })} required placeholder="🇦🇺" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Venue</label>
                                <input type="text" value={newMatch.venue} onChange={e => setNewMatch({ ...newMatch, venue: e.target.value })} required placeholder="Stadium Name, City" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Match Type</label>
                                    <select value={newMatch.matchType} onChange={e => setNewMatch({ ...newMatch, matchType: e.target.value })}>
                                        <option value="T20">T20</option>
                                        <option value="ODI">ODI</option>
                                        <option value="Test">Test</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input type="datetime-local" value={newMatch.date} onChange={e => setNewMatch({ ...newMatch, date: e.target.value })} required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Base Price (₹)</label>
                                    <input type="number" value={newMatch.basePrice} onChange={e => setNewMatch({ ...newMatch, basePrice: e.target.value })} required placeholder="1500" />
                                </div>
                                <div className="form-group">
                                    <label>Stadium Capacity</label>
                                    <input type="number" value={newMatch.availableSeats} onChange={e => setNewMatch({ ...newMatch, availableSeats: e.target.value })} required placeholder="500" />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Schedule Match</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchManagement;
