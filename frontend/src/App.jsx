import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import Payment from './pages/Payment';
import Contact from './pages/Contact';
import Winners from './pages/Winners';
import PaperSubmission from './pages/PaperSubmission';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminWinners from './pages/admin/AdminWinners';
import AdminSettings from './pages/admin/AdminSettings';
import AdminEvents from './pages/admin/AdminEvents';

import BottomNav from './components/BottomNav';

// Public Layout wrapper
function PublicLayout({ children }) {
  return (
    <>
      <main className="pb-24">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
            <Route path="/events/:slug" element={<PublicLayout><EventDetails /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/payment/:registrationId" element={<PublicLayout><Payment /></PublicLayout>} />
            <Route path="/register/success/:registrationId" element={<PublicLayout><RegisterSuccess /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/winners" element={<PublicLayout><Winners /></PublicLayout>} />
            <Route path="/submit-paper" element={<PublicLayout><PaperSubmission /></PublicLayout>} />

            {/* Redirect old gallery/rules routes to home */}
            <Route path="/gallery" element={<Navigate to="/" replace />} />
            <Route path="/rules" element={<Navigate to="/#rules" replace />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="registrations" element={<AdminRegistrations />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="winners" element={<AdminWinners />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <PublicLayout>
                <div className="min-h-screen flex items-center justify-center text-center px-4">
                  <div>
                    <h1 className="text-4xl font-display font-black mb-3" style={{ color: '#222222' }}>404 - Page Not Found</h1>
                    <p className="mb-8" style={{ color: '#555555' }}>The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              </PublicLayout>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
