import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import Dashboard from './components/Dashboard';

// Mock authentication and role function
const isAuthenticated = () => {
  // Implement your authentication logic here
  return false; // Ensure this returns false for testing
};

const getUserRole = () => {
  // Implement your role retrieval logic here
  return 'Guest'; // Change this to actual role retrieval
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen max-w-2xl mx-auto bg-background text-text">
        <Header />
        <div className="flex flex-1">
          {isAuthenticated() && <Sidebar className="hidden md:block" />}
          <main className="flex-1 p-4 md:p-8 lg:p-12 ml-64">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/dashboard" element={
                isAuthenticated() && getUserRole() === 'SalonOwner' ? <Dashboard /> : <Navigate to="/login" replace />
              } />
              <Route path="/" element={
                <>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Welcome to SalonEase</h2>
                  <p className="text-base md:text-lg lg:text-xl">Your salon management solution.</p>
                </>
              } />
              {/* Add more public routes here if needed */}
            </Routes>
          </main>
        </div>
        {isAuthenticated() && <Footer />}
      </div>
    </Router>
  );
}

export default App;
