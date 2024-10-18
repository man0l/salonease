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
import SalonOwnerOnboarding from './components/Onboarding/SalonOwnerOnboarding';

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
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Header />
      <div className="flex-1 flex">
        {user && (
          <Sidebar className="w-64 flex-shrink-0 bg-gray-100 border-r border-gray-200" />
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 relative z-20">
          <div className="container mx-auto px-6 py-8">
            <ToastContainer />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/registration-success" element={<RegistrationSuccess />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    {user && !user.onboardingCompleted ? <SalonOwnerOnboarding /> : <Dashboard />}
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <PrivateRoute allowedRoles={['SuperAdmin']}>
                    <SuperAdminDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">Welcome to SalonEase</h2>
                    <p className="text-xl">Your comprehensive salon management solution.</p>
                  </div>
                } 
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/salons" 
                element={
                  <PrivateRoute allowedRoles={['SalonOwner']}>
                    <SalonManagement />
                  </PrivateRoute>
                } 
              />
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
    <AuthProvider>
      <SalonProvider>
        <Router>
          <AppContent />
        </Router>
      </SalonProvider>
    </AuthProvider>
  );
}

export default App;
