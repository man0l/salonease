import React from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/outline';
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary">SalonEase</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button className="relative text-text hover:text-primary transition-colors">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent"></span>
                </button>
                <Link to="/profile" className="flex items-center space-x-2 text-text hover:text-primary transition-colors">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src="https://via.placeholder.com/150"
                    alt="User avatar"
                  />
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="text-text hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-text hover:text-primary transition-colors">Login</Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
