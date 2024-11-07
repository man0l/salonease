import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SalonProvider } from './contexts/SalonContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import Dashboard from './components/Dashboard/Dashboard';
import Terms from './components/Terms';
import PrivacyPolicy from './components/PrivacyPolicy';
import { useAuth } from './hooks/useAuth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import SalonManagement from './components/Salon/SalonManagement';
import RegistrationSuccess from './components/Auth/RegistrationSuccess';
import StaffManagement from './components/Salon/StaffManagement';
import AcceptInvitation from './components/Salon/AcceptInvitation';
import ROLES from './utils/roles';
import StaffAvailability from './components/Salon/StaffAvailability';
import ServiceManagement from './components/Salon/ServiceManagement';
import ClientsManagement from './components/Clients/ClientsManagement';
import BookingsManagement from './components/Bookings/BookingsManagement';
import PublicSalonPage from './components/Salon/PublicSalonPage';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex">
        {user && (
          <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.STAFF, ROLES.SUPER_ADMIN]}>
            <Sidebar className="w-64 flex-shrink-0 bg-background border-r border-gray-200" />
          </PrivateRoute>
        )}
        <main className="flex-grow overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <ToastContainer />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/registration-success" element={<RegistrationSuccess />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/" 
                element={
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">Welcome to SalonEase</h2>
                    <p className="text-xl">Your comprehensive salon management solution.</p>
                  </div>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.STAFF]}>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <SuperAdminDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/salons" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER]}>
                    <SalonManagement />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/salons/:salonId/staff" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.SUPER_ADMIN]}>
                    <StaffManagement />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/salons/:salonId/staff-availability" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.SUPER_ADMIN]}>
                    <StaffAvailability />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/salons/:salonId/services" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.SUPER_ADMIN]}>
                    <ServiceManagement />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/salons/:salonId/clients" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.STAFF]}>
                    <ClientsManagement />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/salons/:salonId/bookings" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.STAFF]}>
                    <BookingsManagement />
                  </PrivateRoute>
                } 
              />
              <Route path="/salon/:salonId" element={<PublicSalonPage />} />
            </Routes>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SalonProvider>
          <AppContent />
        </SalonProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
