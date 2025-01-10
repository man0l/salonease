import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
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
import BookingsCalendar from './components/Bookings/BookingsCalendar';
import FinancialReports from './components/FinancialReports/FinancialReports';
import './i18n';
import { LanguageProvider } from './contexts/LanguageContext';
import SubscriptionComplete from './components/Subscription/SubscriptionComplete';
import StripeWrapper from './components/Subscription/StripeWrapper';
import PublicRoute from './components/Routes/PublicRoute';
import InvoiceDashboard from './components/Billing/InvoiceDashboard';
import Profile from './components/Profile/Profile'
import Homepage from './components/Pages/Homepage';
import LeadMagnet from './components/Pages/LeadMagnet';
import { useTranslation } from 'react-i18next';
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

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);  
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation(['common']);
  React.useEffect(() => {
    document.title = t('common:meta.title');
    document
      .querySelector('meta[name="description"]')
      .setAttribute('content', t('common:meta.description'));

    const savedTheme = 'light';
    setTheme(savedTheme);
  }, []);

  const isHomepage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex-grow flex">
        {user && (
          <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.STAFF, ROLES.SUPER_ADMIN]}>
            <Sidebar className="w-64 flex-shrink-0 bg-card border-r border-muted" />
          </PrivateRoute>
        )}
        <main className="flex-grow overflow-x-hidden overflow-y-auto">
          <div className={isHomepage ? 'w-full' : 'container mx-auto px-2 sm:px-6 py-8 w-full'}>
            <ToastContainer theme="dark" />
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/registration-success" element={
                <PublicRoute>
                  <RegistrationSuccess />
                </PublicRoute>
              } />
              <Route path="/verify-email" element={
                <PublicRoute>
                  <VerifyEmail />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />
              <Route path="/reset-password" element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } />
              <Route path="/accept-invitation" element={
                <PublicRoute>
                  <AcceptInvitation />
                </PublicRoute>
              } />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route 
                path="/" 
                element={<Homepage />}
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.STAFF, ROLES.SUPER_ADMIN]}>
                    <Profile />
                  </PrivateRoute>
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
              <Route 
                path="/salons/:salonId/bookings-calendar" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER, ROLES.STAFF]}>
                    <BookingsCalendar />
                  </PrivateRoute>
                } 
              />
              <Route path="/salon/:salonId" element={<PublicSalonPage />} />
              <Route 
                path="/salons/:salonId/reports/financial" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER]}>
                    <FinancialReports />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/salons/:salonId/billing" 
                element={
                  <PrivateRoute allowedRoles={[ROLES.SALON_OWNER]}>
                    <InvoiceDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/subscription/complete" 
                element={
                  <StripeWrapper>
                    <SubscriptionComplete />
                  </StripeWrapper>
                } 
              />
              <Route path="/guide" element={
                <PublicRoute>
                  <LeadMagnet />
                </PublicRoute>
              } />
            </Routes>
          </div>
        </main>
      </div>
      <Footer className="bg-card border-t border-muted" />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <SalonProvider>
            <AppContent />
          </SalonProvider>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App;
