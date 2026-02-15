import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, userProfile, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    🏏 CricketBook
                </Link>
                <div className="nav-menu">
                    <Link to="/" className="nav-link">Home</Link>
                    {currentUser ? (
                        <>
                            <Link to="/dashboard" className="nav-link">My Tickets</Link>
                            {userProfile?.role === 'admin' && (
                                <Link to="/admin" className="nav-link">Admin</Link>
                            )}
                            <button onClick={handleLogout} className="nav-link btn-logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/signup" className="nav-link btn-signup">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
