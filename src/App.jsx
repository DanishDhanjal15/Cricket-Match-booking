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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { currentUser, userProfile } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (userProfile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

function AppContent() {
    return (
        <div className="app">
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
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </main>
            <Footer />
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
