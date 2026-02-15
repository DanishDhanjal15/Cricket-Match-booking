import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { logout, userProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Admin logout failed:', error);
        }
    };

    const navItems = [
        { path: '/admin', icon: '📊', label: 'Dashboard' },
        { path: '/admin/scanner', icon: '🔍', label: 'QR Scanner' },
        { path: '/admin/bookings', icon: '🎟️', label: 'All Bookings' },
        { path: '/admin/matches', icon: '🏏', label: 'Matches' },
    ];

    return (
        <div className={`admin-portal ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-logo">
                        🏏 <span>AdminPanel</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user">
                        <div className="avatar">{userProfile?.name?.charAt(0) || 'A'}</div>
                        <div className="user-details">
                            <p className="username">{userProfile?.name || 'Administrator'}</p>
                            <p className="role">Super Admin</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <button
                        className="sidebar-toggle"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        ☰
                    </button>
                    <div className="topbar-actions">
                        <span className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        <Link to="/" className="btn-view-site">View Site ↗</Link>
                    </div>
                </header>

                <section className="admin-page-content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;
