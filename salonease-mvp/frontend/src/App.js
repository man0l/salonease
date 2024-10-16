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
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto bg-background text-text">
      <Header />
      <div className="flex flex-1">
        {user && <Sidebar className="hidden md:block" />}
        <main className="flex-1 p-4 md:p-8 lg:p-12 ml-64">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
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
                <>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Welcome to SalonEase</h2>
                  <p className="text-base md:text-lg lg:text-xl">Your salon management solution.</p>
                </>
              } 
            />
          </Routes>
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
