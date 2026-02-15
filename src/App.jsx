import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/UI/Navbar';
import Footer from './components/UI/Footer';
import Home from './pages/Home';
import MatchDetails from './pages/MatchDetails';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

import AdminLayout from './layouts/AdminLayout';
import QRScanner from './components/Admin/QRScanner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) return null; // Wait for profile to load

    if (!currentUser || userProfile?.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    return children;
};

import MatchManagement from './components/Admin/MatchManagement';

function AppContent() {
    return (
        <div className="app">
            <Routes>
                {/* Public Website Routes */}
                <Route path="/*" element={
                    <>
                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/match/:matchId" element={<MatchDetails />} />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <UserDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </main>
                        <Footer />
                    </>
                } />

                {/* Dedicated Admin Portal Routes */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<AdminDashboard initialTab="stats" />} />
                    <Route path="scanner" element={<QRScanner />} />
                    <Route path="bookings" element={<AdminDashboard initialTab="bookings" />} />
                    <Route path="matches" element={<MatchManagement />} />
                </Route>
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
