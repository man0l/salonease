import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import Dashboard from './components/Dashboard';
import Terms from './components/Terms';
import PrivacyPolicy from './components/PrivacyPolicy';
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Header />
      <div className="flex flex-1">
        {user && <Sidebar className="hidden md:block w-64 flex-shrink-0" />}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
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
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
