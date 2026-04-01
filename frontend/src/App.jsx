import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import AuthGateway from './pages/AuthGateway';
import GateBackground from './components/GateBackground';

import Dashboard from './pages/Dashboard';
import LearningLab from './pages/LearningLab';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children, roleRequired }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen w-screen bg-black flex items-center justify-center font-black animate-pulse">Initializing Lab_</div>;
    if (!user) return <Navigate to="/login" />;
    if (roleRequired && user.role !== roleRequired) return <Navigate to="/dashboard" />;
    return children;
};

const Layout = ({ children }) => {
    return (
        <div className="flex bg-[#000000] h-screen overflow-hidden relative">
            <Sidebar />
            <div className="noise-bg" />
            <main className="flex-1 h-full overflow-y-auto relative z-10 custom-scrollbar">
                {children}
            </main>
        </div>
    );
};

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
    >
        {children}
    </motion.div>
);

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<PageWrapper><AuthGateway /></PageWrapper>} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout><PageWrapper><Dashboard /></PageWrapper></Layout></ProtectedRoute>} />
                <Route path="/learn" element={<ProtectedRoute><Layout><PageWrapper><LearningLab /></PageWrapper></Layout></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><Layout><PageWrapper><AdminDashboard /></PageWrapper></Layout></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <AuthProvider>
            <GateBackground />
            <Router>
                <AnimatedRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
