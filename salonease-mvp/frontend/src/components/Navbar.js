import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold">SalonEase</Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/features" className="hover:bg-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</Link>
              <Link to="/pricing" className="hover:bg-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</Link>
              <Link to="/contact" className="hover:bg-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</Link>
              {!user && (
                <>
                  <Link to="/login" className="hover:bg-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                  <Link to="/register" className="bg-white text-primary hover:bg-secondary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
